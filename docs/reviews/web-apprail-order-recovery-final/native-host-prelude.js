/*
 * CP-FEATURES-01 batch 28 (contract §14 E12, E13): page prelude for ./native-host-matrix.tsx (Settings host
 * composition, E12 host matrix) and ./native-downstream.tsx (production App composition, E13 downstream).
 * Verification only: it repairs nothing and changes no product file. The earlier preludes in this directory
 * (./native-prelude.js, ./native-fixed-prelude.js) are not modified; this new file combines their instruments
 * and adds the host-matrix ones.
 *
 * Served by ./native-host-harness.mjs as a classic script BEFORE the module bundle (and alone on a product-free
 * seed page, where its self-test runs), so every instrument exists before any product module evaluates,
 * including the production router module of the App composition. It defines window.__native:
 *   - one global sequence shared by every trace, so a mark windows attempts, locks, history calls, pops,
 *     events, frames and errors together;
 *   - attempt-level Storage tracing: every getItem/setItem/removeItem/key/clear/length attempt is logged BEFORE
 *     any fault decision and before delegation. Faults: total denial, per-key get/set/remove denial, a
 *     value-specific setItem denial (only the named value of a key is refused) and one-shot readback denial.
 *     A fault throws a SecurityError DOMException and never reaches storage;
 *   - the instrumented window.dispatchEvent of contract §10 item 5 (every StorageEvent passed to it, with its
 *     key) and a first-registered window "storage" listener (every storage event actually delivered);
 *   - Web Lock tracing (application vs fixture) with fixture hold/release of a named exclusive lock and a
 *     fixture "middle" request queued behind the engine's own request for the same real lock name;
 *   - history.pushState/replaceState own-property wrappers (log, then delegate), a popstate trace, and
 *     window add/removeEventListener("beforeunload") tracking (active listener set);
 *   - a sequence-stamped console.error trace (delegating, so CDP still sees every call) and a detector for an
 *     error element replacing the UI (React Router's default element or the production RouteErrorBoundary);
 *   - export tracing (object URLs, the export anchor's click and DOM insertion/removal) and a window.confirm
 *     recorder (the dialog itself stays native and is answered through CDP);
 *   - network recorders refusing anything that is not same-origin;
 *   - capture-phase trusted-input traces (click, keydown, drag events);
 *   - armed DOM observers (<html> attributes, insertion/removal of watched surfaces), element identity, an armed
 *     requestAnimationFrame sampler of the displayed App values, and read-only views of the Features pane, the
 *     departure dialog, the command palette and a synthetic cancelable beforeunload.
 * Every instrument delegates to the native implementation; none schedules product work.
 */
(function installFeaturesHostPrelude() {
  "use strict";
  var v = {
    seq: 0,
    attempts: [],
    storageDispatches: [],
    storageReceived: [],
    network: [],
    lockLog: [],
    confirmLog: [],
    events: [],
    drags: [],
    historyCalls: [],
    pops: [],
    unloadLog: [],
    consoleErrors: [],
    errorUi: [],
    frames: [],
    sampling: false,
    domLog: [],
    htmlLog: [],
    marked: {},
    faults: { all: false, get: new Set(), set: new Set(), remove: new Set(), setValue: new Map(), readbackOnNextSet: new Set(), readbackOnNextRemove: new Set(), readbackArmed: new Set() },
    planApplied: null,
  };
  v.next = function next() { v.seq += 1; return v.seq; };
  v.mark = function mark() { return v.seq; };
  var after = function (list, mark) { return list.filter(function (entry) { return entry.seq > mark; }); };
  var copy = function (value) { return JSON.parse(JSON.stringify(value === undefined ? null : value)); };
  var FEATURES_DOWNLOAD = "features-draft.json";

  // ------------------------------------------------------------------------------------------------
  // Attempt-level Storage instrumentation (recorded BEFORE any fault decision or delegation)
  // ------------------------------------------------------------------------------------------------
  var proto = Storage.prototype;
  var native = { get: proto.getItem, set: proto.setItem, remove: proto.removeItem, key: proto.key, clear: proto.clear };
  var lengthDescriptor = Object.getOwnPropertyDescriptor(proto, "length");
  var realLocal = window.localStorage;
  var realSession = null;
  try { realSession = window.sessionStorage; } catch (error) { realSession = null; }
  var areaOf = function (area) { return area === realLocal ? "local" : area === realSession ? "session" : "other"; };
  var log = function (op, area, key, value) {
    var entry = { seq: v.next(), op: op, area: areaOf(area), key: key, outcome: "ok" };
    if (value !== undefined) entry.value = value;
    v.attempts.push(entry);
    return entry;
  };
  var refuse = function (entry, outcome, message) {
    entry.outcome = outcome;
    throw new DOMException(message, "SecurityError");
  };
  var faults = v.faults;
  proto.getItem = function getItem(key) {
    var name = String(key);
    var entry = log("get", this, name);
    if (this === realLocal) {
      if (faults.all || faults.get.has(name)) refuse(entry, "denied", "fixture denied read");
      if (faults.readbackArmed.has(name)) {
        faults.readbackArmed.delete(name);
        refuse(entry, "readback-denied", "fixture denied readback");
      }
    }
    return native.get.call(this, key);
  };
  proto.setItem = function setItem(key, value) {
    var name = String(key);
    var raw = String(value);
    var entry = log("set", this, name, raw);
    if (this === realLocal) {
      if (faults.all || faults.set.has(name)) refuse(entry, "denied", "fixture denied write");
      var values = faults.setValue.get(name);
      if (values && values.has(raw)) refuse(entry, "denied-value", "fixture denied this value");
    }
    native.set.call(this, key, value);
    if (this === realLocal && faults.readbackOnNextSet.has(name)) {
      faults.readbackOnNextSet.delete(name);
      faults.readbackArmed.add(name);
    }
  };
  proto.removeItem = function removeItem(key) {
    var name = String(key);
    var entry = log("remove", this, name);
    if (this === realLocal && (faults.all || faults.remove.has(name))) refuse(entry, "denied", "fixture denied remove");
    native.remove.call(this, key);
    if (this === realLocal && faults.readbackOnNextRemove.has(name)) {
      faults.readbackOnNextRemove.delete(name);
      faults.readbackArmed.add(name);
    }
  };
  proto.key = function key(index) {
    var entry = log("key", this, null);
    if (this === realLocal && faults.all) refuse(entry, "denied", "fixture denied key");
    return native.key.call(this, index);
  };
  proto.clear = function clear() {
    var entry = log("clear", this, null);
    if (this === realLocal && faults.all) refuse(entry, "denied", "fixture denied clear");
    native.clear.call(this);
  };
  Object.defineProperty(proto, "length", {
    configurable: true,
    enumerable: lengthDescriptor.enumerable,
    get: function () {
      var entry = log("length", this, null);
      if (this === realLocal && faults.all) refuse(entry, "denied", "fixture denied length");
      return lengthDescriptor.get.call(this);
    },
  });
  // Uninstrumented access for the runner and fixtures (seeding, physical byte reads); never counted.
  v.native = {
    get: function (key) { return native.get.call(realLocal, key); },
    set: function (key, value) { native.set.call(realLocal, key, value); },
    remove: function (key) { native.remove.call(realLocal, key); },
    clear: function () { native.clear.call(realLocal); },
    snapshot: function () {
      var out = {};
      var count = lengthDescriptor.get.call(realLocal);
      for (var index = 0; index < count; index += 1) {
        var name = native.key.call(realLocal, index);
        if (name !== null) out[name] = native.get.call(realLocal, name);
      }
      return out;
    },
    bytes: function (keys) {
      var out = {};
      keys.forEach(function (key) { out[key] = native.get.call(realLocal, key); });
      return out;
    },
  };
  var addAll = function (set, keys) { [].concat(keys).forEach(function (key) { set.add(String(key)); }); };
  v.denyAll = function () { faults.all = true; return true; };
  v.denyGet = function (keys) { addAll(faults.get, keys); return true; };
  v.denySet = function (keys) { addAll(faults.set, keys); return true; };
  v.denyRemove = function (keys) { addAll(faults.remove, keys); return true; };
  v.denySetValue = function (key, value) {
    var name = String(key);
    var values = faults.setValue.get(name) || new Set();
    values.add(String(value));
    faults.setValue.set(name, values);
    return true;
  };
  v.uncertainSet = function (key) { faults.readbackOnNextSet.add(String(key)); return true; };
  v.uncertainRemove = function (key) { faults.readbackOnNextRemove.add(String(key)); return true; };
  v.restore = function () {
    faults.all = false;
    faults.get.clear();
    faults.set.clear();
    faults.remove.clear();
    faults.setValue.clear();
    faults.readbackOnNextSet.clear();
    faults.readbackOnNextRemove.clear();
    faults.readbackArmed.clear();
    return true;
  };
  v.faultState = function () {
    var values = [];
    faults.setValue.forEach(function (set, key) { values.push([key, Array.from(set)]); });
    return {
      all: faults.all,
      get: Array.from(faults.get),
      set: Array.from(faults.set),
      remove: Array.from(faults.remove),
      setValue: values,
      readbackOnNextSet: Array.from(faults.readbackOnNextSet),
      readbackOnNextRemove: Array.from(faults.readbackOnNextRemove),
      readbackArmed: Array.from(faults.readbackArmed),
    };
  };
  /** Positive control: one patched getItem through the page's real localStorage object. */
  v.probe = function (key) {
    var before = v.attempts.length;
    var threw = false;
    try { window.localStorage.getItem(key || "xai_pref_features_tasks"); } catch (error) { threw = error instanceof DOMException && error.name === "SecurityError"; }
    var last = v.attempts[v.attempts.length - 1] || null;
    return { logged: v.attempts.length - before, threw: threw, last: last ? { op: last.op, key: last.key, outcome: last.outcome } : null };
  };
  // A fault plan installed before any page script (Page.addScriptToEvaluateOnNewDocument).
  var plan = window.__nativeFaultPlan;
  if (plan && typeof plan === "object") {
    if (Array.isArray(plan.get)) addAll(faults.get, plan.get);
    v.planApplied = { get: Array.isArray(plan.get) ? plan.get.slice() : [] };
  }

  // ------------------------------------------------------------------------------------------------
  // Instrumented window.dispatchEvent (StorageEvent counter) and delivered storage events
  // ------------------------------------------------------------------------------------------------
  var nativeDispatch = window.dispatchEvent;
  window.dispatchEvent = function dispatchEvent(event) {
    if (event instanceof StorageEvent) {
      v.storageDispatches.push({ seq: v.next(), key: event.key, local: event.storageArea === realLocal, trusted: event.isTrusted });
    }
    return nativeDispatch.call(this, event);
  };
  var nativeAddListener = window.addEventListener;
  var nativeRemoveListener = window.removeEventListener;
  nativeAddListener.call(window, "storage", function (event) {
    v.storageReceived.push({ seq: v.next(), key: event.key, trusted: event.isTrusted, local: event.storageArea === realLocal, newValue: event.newValue });
  });

  // ------------------------------------------------------------------------------------------------
  // beforeunload listener tracking (window add/remove) and the popstate trace
  // ------------------------------------------------------------------------------------------------
  var unloadListeners = new Set();
  window.addEventListener = function addEventListener(type, listener, options) {
    var target = this === undefined || this === null ? window : this;
    if (type === "beforeunload" && listener && target === window) {
      unloadListeners.add(listener);
      v.unloadLog.push({ seq: v.next(), op: "add", active: unloadListeners.size });
    }
    return nativeAddListener.call(target, type, listener, options);
  };
  window.removeEventListener = function removeEventListener(type, listener, options) {
    var target = this === undefined || this === null ? window : this;
    if (type === "beforeunload" && listener && target === window) {
      unloadListeners.delete(listener);
      v.unloadLog.push({ seq: v.next(), op: "remove", active: unloadListeners.size });
    }
    return nativeRemoveListener.call(target, type, listener, options);
  };
  v.unloadActive = function () { return unloadListeners.size; };
  /** Positive control for the listener tracker: one add, one remove of a fixture-owned no-op listener. */
  v.unloadSelfTest = function () {
    var before = unloadListeners.size;
    var noop = function () {};
    window.addEventListener("beforeunload", noop);
    var during = unloadListeners.size;
    window.removeEventListener("beforeunload", noop);
    return { before: before, during: during, after: unloadListeners.size };
  };
  var routerHistoryState = function (state) { return state !== null && typeof state === "object" ? state : null; };
  nativeAddListener.call(window, "popstate", function (event) {
    var parsed = routerHistoryState(event.state);
    v.pops.push({ seq: v.next(), path: location.pathname, key: parsed && parsed.key !== undefined ? parsed.key : null, idx: parsed && parsed.idx !== undefined ? parsed.idx : null });
  });

  // ------------------------------------------------------------------------------------------------
  // History instrumentation: pushState/replaceState own-property wrappers (log, then delegate)
  // ------------------------------------------------------------------------------------------------
  var protoPush = History.prototype.pushState;
  var protoReplace = History.prototype.replaceState;
  var logHistory = function (method, state, url) {
    var parsed = routerHistoryState(state);
    v.historyCalls.push({
      seq: v.next(),
      method: method,
      url: String(url === undefined || url === null ? "" : url),
      key: parsed && parsed.key !== undefined ? parsed.key : null,
      idx: parsed && parsed.idx !== undefined ? parsed.idx : null,
      usr: copy(parsed && parsed.usr !== undefined ? parsed.usr : null),
    });
  };
  history.pushState = function pushState(state, unused, url) {
    logHistory("pushState", state, url);
    return protoPush.call(this, state, unused, url);
  };
  history.replaceState = function replaceState(state, unused, url) {
    logHistory("replaceState", state, url);
    return protoReplace.call(this, state, unused, url);
  };
  v.historyWrapped = function () { return history.pushState !== protoPush && history.replaceState !== protoReplace; };
  var navigationApi = window.navigation;
  var pathOf = function (url) {
    if (url === null || url === undefined) return null;
    try { return new URL(url).pathname; } catch (error) { return String(url); }
  };
  v.navEntries = function () {
    if (!navigationApi) return null;
    return navigationApi.entries().map(function (entry) { return { key: entry.key, id: entry.id, path: pathOf(entry.url), index: entry.index }; });
  };
  v.navCurrent = function () {
    if (!navigationApi || !navigationApi.currentEntry) return null;
    var entry = navigationApi.currentEntry;
    return { key: entry.key, id: entry.id, path: pathOf(entry.url), index: entry.index };
  };
  v.navigationApiPresent = function () { return Boolean(navigationApi); };
  v.historyLength = function () { return history.length; };
  v.historyState = function () { return copy(history.state); };

  // ------------------------------------------------------------------------------------------------
  // Runtime-error localization: console.error trace (delegating) and an error-element detector
  // ------------------------------------------------------------------------------------------------
  var nativeConsoleError = console.error;
  console.error = function error() {
    var args = Array.prototype.slice.call(arguments);
    v.consoleErrors.push({
      seq: v.next(),
      path: location.pathname,
      text: args.map(function (value) { return value instanceof Error ? value.name + ": " + value.message : String(value); }).join(" ").replace(/\s+/g, " ").slice(0, 300),
    });
    return nativeConsoleError.apply(console, args);
  };
  var errorShown = false;
  var detectErrorUi = function () {
    var headings = document.querySelectorAll("h1, h2");
    var found = null;
    for (var index = 0; index < headings.length && !found; index += 1) {
      var content = headings[index].textContent || "";
      if (content.indexOf("Unexpected Application Error") !== -1 || content.indexOf("Route Error (") === 0) found = headings[index];
    }
    if (found && !errorShown) {
      errorShown = true;
      v.errorUi.push({ seq: v.next(), path: location.pathname, text: ((found.parentElement && found.parentElement.textContent) || "").replace(/\s+/g, " ").slice(0, 300) });
    } else if (!found) {
      errorShown = false;
    }
  };

  // ------------------------------------------------------------------------------------------------
  // Web Lock tracing; fixture-held exclusive locks and "middle" requests by real lock name
  // ------------------------------------------------------------------------------------------------
  var fixtureLocking = false;
  var held = {};
  var middles = {};
  if (typeof LockManager !== "undefined" && LockManager.prototype.request) {
    var nativeRequest = LockManager.prototype.request;
    LockManager.prototype.request = function request(name) {
      var rest = Array.prototype.slice.call(arguments, 1);
      var options = rest.length > 1 && rest[0] !== null && typeof rest[0] === "object" ? rest[0] : {};
      v.lockLog.push({ seq: v.next(), name: String(name), mode: options.mode || "exclusive", by: fixtureLocking ? "fixture" : "app" });
      return nativeRequest.apply(this, arguments);
    };
  }
  var fixtureRequest = function (name) {
    var release;
    var gate = new Promise(function (resolve) { release = resolve; });
    var lock = { name: name, release: release, done: null, acquired: false };
    fixtureLocking = true;
    try {
      lock.done = navigator.locks.request(name, { mode: "exclusive" }, function () { lock.acquired = true; return gate; });
    } finally {
      fixtureLocking = false;
    }
    return lock;
  };
  /** Holds a real exclusive lock; resolves once the fixture actually holds it. */
  v.hold = function (name) {
    if (held[name]) return Promise.reject(new Error("fixture lock already held: " + name));
    var lock = fixtureRequest(name);
    held[name] = lock;
    var waited = 0;
    return new Promise(function (resolve, reject) {
      var poll = function () {
        if (lock.acquired) { resolve(name); return; }
        waited += 5;
        if (waited > 2000) { reject(new Error("fixture lock never acquired: " + name)); return; }
        setTimeout(poll, 5);
      };
      poll();
    });
  };
  v.release = function (name) {
    var lock = held[name];
    if (!lock) return Promise.reject(new Error("fixture lock not held: " + name));
    lock.release();
    return lock.done.then(function () { delete held[name]; return name; });
  };
  /** Queued (not awaited): acquires only after every earlier request for the same real lock name. */
  v.queueMiddle = function (name) {
    if (middles[name]) throw new Error("middle request already queued: " + name);
    middles[name] = fixtureRequest(name);
    return name;
  };
  v.releaseMiddle = function (name) {
    var lock = middles[name];
    if (!lock) return Promise.reject(new Error("middle request not queued: " + name));
    lock.release();
    return lock.done.then(function () { delete middles[name]; return name; });
  };
  v.middleAcquired = function (name) { return middles[name] ? middles[name].acquired : null; };
  v.heldByFixture = function () { return Object.keys(held); };
  v.lockQuery = function () {
    return navigator.locks.query().then(function (snapshot) {
      return {
        held: (snapshot.held || []).map(function (lock) { return String(lock.name); }),
        pending: (snapshot.pending || []).map(function (lock) { return String(lock.name); }),
      };
    });
  };

  // ------------------------------------------------------------------------------------------------
  // Export tracing: object URLs, the export anchor's click, its DOM insertion/removal
  // ------------------------------------------------------------------------------------------------
  var urlTrace = { createAttempts: 0, created: [], revoked: [] };
  var clickTrace = { attempts: 0, hrefs: [] };
  var anchorTrace = { added: [], removed: [] };
  var nativeCreate = URL.createObjectURL;
  var nativeRevoke = URL.revokeObjectURL;
  URL.createObjectURL = function createObjectURL(object) {
    urlTrace.createAttempts += 1;
    var url = nativeCreate.call(URL, object);
    urlTrace.created.push(url);
    return url;
  };
  URL.revokeObjectURL = function revokeObjectURL(url) {
    urlTrace.revoked.push(String(url));
    return nativeRevoke.call(URL, url);
  };
  var nativeClick = HTMLElement.prototype.click;
  Object.defineProperty(HTMLAnchorElement.prototype, "click", {
    configurable: true,
    writable: true,
    value: function click() {
      if (this.download === FEATURES_DOWNLOAD) {
        clickTrace.attempts += 1;
        clickTrace.hrefs.push(this.href);
      }
      return nativeClick.call(this);
    },
  });
  var handleAnchorRecords = function (records) {
    records.forEach(function (record) {
      Array.prototype.forEach.call(record.addedNodes, function (node) { if (node instanceof HTMLAnchorElement && node.download === FEATURES_DOWNLOAD) anchorTrace.added.push(node.href); });
      Array.prototype.forEach.call(record.removedNodes, function (node) { if (node instanceof HTMLAnchorElement && node.download === FEATURES_DOWNLOAD) anchorTrace.removed.push(node.href); });
    });
  };
  var anchorObserver = new MutationObserver(handleAnchorRecords);
  v.urlTrace = function () { return copy(urlTrace); };
  v.clickTrace = function () { return copy(clickTrace); };
  v.anchorTrace = function () { handleAnchorRecords(anchorObserver.takeRecords()); return copy(anchorTrace); };
  v.anchorsInDom = function () { return document.querySelectorAll('a[download="' + FEATURES_DOWNLOAD + '"]').length; };

  // ------------------------------------------------------------------------------------------------
  // window.confirm recorder (the dialog stays native and is answered through CDP)
  // ------------------------------------------------------------------------------------------------
  var nativeConfirm = window.confirm;
  window.confirm = function confirm(message) {
    v.confirmLog.push({ seq: v.next(), phase: "call", message: String(message) });
    var result = nativeConfirm.call(window, message);
    v.confirmLog.push({ seq: v.next(), phase: "return", result: result });
    return result;
  };

  // ------------------------------------------------------------------------------------------------
  // Network recorders (local server only)
  // ------------------------------------------------------------------------------------------------
  var local = function (url) {
    try { return new URL(String(url), location.href).origin === location.origin; } catch (error) { return false; }
  };
  var netLog = function (kind, url) {
    var entry = { seq: v.next(), kind: kind, url: String(url).slice(0, 200), local: local(url) };
    v.network.push(entry);
    return entry;
  };
  var nativeFetch = window.fetch;
  window.fetch = function fetch(input, init) {
    var url = typeof input === "string" ? input : input instanceof URL ? input.href : input && input.url;
    var entry = netLog("fetch", url);
    if (!entry.local) return Promise.reject(new TypeError("native fixture: non-local network refused"));
    return nativeFetch.call(window, input, init);
  };
  var nativeOpen = XMLHttpRequest.prototype.open;
  XMLHttpRequest.prototype.open = function open(method, url) {
    var entry = netLog("xhr", url);
    if (!entry.local) throw new TypeError("native fixture: non-local network refused");
    return nativeOpen.apply(this, arguments);
  };
  var NativeSocket = window.WebSocket;
  window.WebSocket = function WebSocket(url) { netLog("websocket", url); throw new TypeError("native fixture: WebSocket refused"); };
  window.WebSocket.prototype = NativeSocket.prototype;
  var NativeEventSource = window.EventSource;
  window.EventSource = function EventSource(url) { netLog("eventsource", url); throw new TypeError("native fixture: EventSource refused"); };
  window.EventSource.prototype = NativeEventSource.prototype;
  if (navigator.sendBeacon) navigator.sendBeacon = function sendBeacon(url) { netLog("beacon", url); return false; };

  // ------------------------------------------------------------------------------------------------
  // Trusted-input traces (capture phase)
  // ------------------------------------------------------------------------------------------------
  var squash = function (value) { return String(value || "").replace(/\s+/g, " ").trim(); };
  var describe = function (element) {
    if (!(element instanceof Element)) return "none";
    var control = element.closest('[role="switch"],button,.list-row,[role="option"]');
    if (!control) {
      if (element.closest(".cmdk-scrim") && !element.closest(".cmdk-modal")) return "cmdk-scrim";
      return element.tagName.toLowerCase() + (element.classList.contains("settings-departure-dialog") ? ".settings-departure-dialog" : "");
    }
    if (control.getAttribute("role") === "switch") {
      var card = control.closest("[data-feature-id]");
      return "switch:" + (card ? card.getAttribute("data-feature-id") : control.getAttribute("aria-label"));
    }
    if (control.classList.contains("list-row")) return "sidebar:" + squash(control.textContent);
    if (control.closest(".app-rail")) return "rail:" + (control.getAttribute("aria-label") || "");
    if (control.closest(".settings-departure-dialog")) return "dialog:" + squash(control.textContent);
    if (control.classList.contains("search-box")) return "search-box";
    return "button:" + squash(control.getAttribute("aria-label") || control.textContent).slice(0, 80);
  };
  var WATCHED_INPUT = ".features-pane, .settings-departure-dialog, .settings-sidebar, .app-rail, .topbar, .cmdk-scrim";
  ["click", "keydown"].forEach(function (type) {
    document.addEventListener(type, function (event) {
      var target = event.target;
      if (!(target instanceof Element) || !target.closest(WATCHED_INPUT)) return;
      var entry = { seq: v.next(), type: type, trusted: event.isTrusted, target: describe(target) };
      if (event instanceof KeyboardEvent) entry.key = event.key;
      v.events.push(entry);
    }, true);
  });
  ["dragstart", "dragenter", "dragover", "drop", "dragend"].forEach(function (type) {
    document.addEventListener(type, function (event) {
      var button = event.target instanceof Element ? event.target.closest(".app-rail .rail-btn") : null;
      if (!button) return;
      v.drags.push({ seq: v.next(), type: type, trusted: event.isTrusted, target: button.getAttribute("aria-label") });
    }, true);
  });

  // ------------------------------------------------------------------------------------------------
  // Read-only views: Features pane, departure dialog, command palette, focus; synthetic beforeunload
  // ------------------------------------------------------------------------------------------------
  var text = function (element) { return element ? squash(element.textContent) : null; };
  var nameOf = function (button) { return squash(button.getAttribute("aria-label") || button.textContent); };
  var PANE = '.settings-detail[data-pane="features"] .features-pane';
  v.features = function () {
    var pane = document.querySelector(PANE);
    if (!pane) return null;
    var switches = {};
    var recovery = [];
    Array.prototype.forEach.call(pane.querySelectorAll(".feat-card[data-feature-id]"), function (card) {
      var id = card.getAttribute("data-feature-id");
      var control = card.querySelector('[role="switch"]');
      switches[id] = control ? control.getAttribute("aria-checked") : null;
      var field = card.querySelector(".features-recovery-field");
      if (field) {
        var message = field.querySelector(".features-recovery-text");
        recovery.push({ id: id, text: text(message), role: message ? message.getAttribute("role") : null, buttons: Array.prototype.map.call(field.querySelectorAll("button"), nameOf) });
      }
    });
    var actions = pane.querySelector(".features-recovery-actions");
    var alert = actions ? actions.querySelector('[role="alert"]') : null;
    var status = pane.querySelector(".features-recovery-status");
    return {
      switches: switches,
      recovery: recovery,
      status: status ? text(status) : null,
      actions: actions ? { buttons: Array.prototype.map.call(actions.querySelectorAll("button"), nameOf), alert: alert ? text(alert) : null } : null,
      resetButtons: Array.prototype.map.call(pane.querySelectorAll('[data-testid="features-reset-defaults"]'), nameOf),
    };
  };
  v.dialog = function () {
    var dialog = document.querySelector('.settings-departure-dialog[role="dialog"]');
    if (!dialog) return null;
    return { label: dialog.getAttribute("aria-label"), text: text(dialog.querySelector("p")), buttons: Array.prototype.map.call(dialog.querySelectorAll("button"), function (button) { return text(button); }) };
  };
  v.focusInDialog = function () { var active = document.activeElement; return Boolean(active && active.closest && active.closest(".settings-departure-dialog")); };
  v.cmdk = function () {
    var modal = document.querySelector(".cmdk-modal");
    if (!modal) return { open: false, labels: [], empty: null };
    return {
      open: true,
      labels: Array.prototype.map.call(modal.querySelectorAll(".cmdk-list .cmdk-row .cmdk-row-label"), function (element) { return text(element); }),
      empty: text(modal.querySelector(".cmdk-empty")),
    };
  };
  v.focus = function () {
    var element = document.activeElement;
    if (!element) return null;
    return { tag: element.tagName.toLowerCase(), name: element.getAttribute ? squash(element.getAttribute("aria-label") || element.textContent).slice(0, 60) : "", isBody: element === document.body, inPane: Boolean(element.closest && element.closest(".features-pane")) };
  };
  /** Synthetic cancelable beforeunload (BeforeUnloadEvent is not constructible); counts handler attempts. */
  v.warn = function () {
    var before = v.attempts.length;
    var event = new Event("beforeunload", { cancelable: true });
    window.dispatchEvent(event);
    return { warned: event.defaultPrevented, attempts: v.attempts.length - before };
  };

  // ------------------------------------------------------------------------------------------------
  // Displayed App values: probe (per frame) and full snapshot (pattern of ./native-prelude.js)
  // ------------------------------------------------------------------------------------------------
  var labels = function (selector) {
    return Array.prototype.map.call(document.querySelectorAll(selector), function (element) { return element.getAttribute("aria-label"); });
  };
  var rect = function (element) {
    if (!element) return null;
    var box = element.getBoundingClientRect();
    var round = function (value) { return Math.round(value * 100) / 100; };
    return { left: round(box.left), top: round(box.top), right: round(box.right), bottom: round(box.bottom), width: round(box.width), height: round(box.height) };
  };
  var fnv = function (value) {
    var hash = 0x811c9dc5;
    for (var index = 0; index < value.length; index += 1) {
      hash ^= value.charCodeAt(index);
      hash = Math.imul(hash, 0x01000193) >>> 0;
    }
    return ("00000000" + hash.toString(16)).slice(-8);
  };
  var petAnim = function (body) {
    if (!body) return null;
    return Array.prototype.find.call(body.classList, function (name) { return name.indexOf("pet-anim-") === 0; }) || null;
  };
  v.view = function view() {
    var html = document.documentElement;
    var rail = document.querySelector(".app-rail");
    var pet = document.querySelector(".pet-wrap");
    var pane = document.querySelector(PANE);
    var status = pane ? pane.querySelector(".features-recovery-status") : null;
    return {
      gate: Boolean(document.querySelector(".account-data-gate")),
      pane: Boolean(pane),
      status: status ? text(status) : null,
      recoveryBlocks: pane ? pane.querySelectorAll(".features-recovery-field").length : 0,
      dialog: Boolean(document.querySelector(".settings-departure-dialog")),
      hue: getComputedStyle(html).getPropertyValue("--accent-hue").trim(),
      tone: html.getAttribute("data-bg-tone"),
      railPos: html.getAttribute("data-rail-pos"),
      railDataPos: rail ? rail.getAttribute("data-pos") : null,
      rail: labels(".app-rail .rail-items .rail-btn").join("|"),
      petAnim: petAnim(pet && pet.querySelector(".pet-body")),
      petTransform: pet ? pet.style.transform : null,
    };
  };
  v.snapshot = function snapshot() {
    var html = document.documentElement;
    var styles = getComputedStyle(html);
    var app = document.querySelector(".app");
    var rail = document.querySelector(".app-rail");
    var pet = document.querySelector(".pet-wrap");
    var body = pet && pet.querySelector(".pet-body");
    var art = body ? Array.prototype.filter.call(body.children, function (child) { return !child.classList.contains("pet-shadow"); }).map(function (child) { return child.outerHTML; }).join("") : "";
    return {
      computed: {
        accentHue: styles.getPropertyValue("--accent-hue").trim(),
        accent: styles.getPropertyValue("--accent").trim(),
        bgApp: styles.getPropertyValue("--bg-app").trim(),
        bodyBackground: getComputedStyle(document.body).backgroundColor,
        bgTone: html.getAttribute("data-bg-tone"),
        htmlRailPos: html.getAttribute("data-rail-pos"),
        appRailPos: app ? app.getAttribute("data-rail-pos") : null,
        railDataPos: rail ? rail.getAttribute("data-pos") : null,
        railRect: rect(rail),
        railGrid: rail ? getComputedStyle(rail).gridColumn + " / " + getComputedStyle(rail).gridRow : null,
        petAnim: petAnim(body),
        petArtFnv: art ? fnv(art) : null,
        petTransform: pet ? pet.style.transform : null,
        petPosition: pet ? { left: rect(pet).left, top: rect(pet).top } : null,
      },
      railOrder: labels(".app-rail .rail-items .rail-btn"),
    };
  };
  var sample = function (timestamp) {
    if (!v.sampling) return;
    var entry = v.view();
    entry.seq = v.next();
    entry.t = Math.round(timestamp * 10) / 10;
    v.frames.push(entry);
    requestAnimationFrame(sample);
  };
  v.startFrames = function () { v.frames = []; v.sampling = true; requestAnimationFrame(sample); return true; };
  v.stopFrames = function () { v.sampling = false; return v.frames.slice(); };

  // ------------------------------------------------------------------------------------------------
  // DOM observers, element identity (armed)
  // ------------------------------------------------------------------------------------------------
  var WATCHED = [
    ["gate", ".account-data-gate"],
    ["shell", ".app"],
    ["rail", ".app-rail"],
    ["pet", ".pet-wrap"],
    ["settingsShell", ".settings-shell"],
    ["sidebar", ".settings-sidebar"],
    ["detail", ".settings-detail"],
    ["pane", ".features-pane"],
  ];
  var hits = function (node) {
    if (!(node instanceof Element)) return [];
    return WATCHED.filter(function (pair) { return node.matches(pair[1]) || node.querySelector(pair[1]) !== null; }).map(function (pair) { return pair[0]; });
  };
  var handleRecords = function (records) {
    records.forEach(function (record) {
      if (record.type === "attributes") {
        v.htmlLog.push({ seq: v.next(), attribute: record.attributeName, old: record.oldValue, now: record.target.getAttribute(record.attributeName) });
        return;
      }
      Array.prototype.forEach.call(record.addedNodes, function (node) {
        var found = hits(node);
        if (found.length) v.domLog.push({ seq: v.next(), kind: "added", what: found });
      });
      Array.prototype.forEach.call(record.removedNodes, function (node) {
        var found = hits(node);
        if (found.length) v.domLog.push({ seq: v.next(), kind: "removed", what: found });
      });
    });
  };
  var htmlObserver = new MutationObserver(handleRecords);
  var treeObserver = new MutationObserver(handleRecords);
  v.startDom = function () {
    v.domLog = [];
    v.htmlLog = [];
    htmlObserver.observe(document.documentElement, { attributes: true, attributeOldValue: true });
    treeObserver.observe(document.body, { childList: true, subtree: true });
    return true;
  };
  v.stopDom = function () {
    handleRecords(htmlObserver.takeRecords());
    handleRecords(treeObserver.takeRecords());
    htmlObserver.disconnect();
    treeObserver.disconnect();
    return { dom: v.domLog.slice(), html: v.htmlLog.slice() };
  };
  v.markElements = function () {
    v.marked = {};
    WATCHED.forEach(function (pair) { v.marked[pair[0]] = document.querySelector(pair[1]); });
    return Object.keys(v.marked).filter(function (name) { return v.marked[name] !== null; });
  };
  v.elementFates = function () {
    var out = {};
    WATCHED.forEach(function (pair) {
      var stored = v.marked[pair[0]] || null;
      var current = document.querySelector(pair[1]);
      out[pair[0]] = { marked: Boolean(stored), connected: Boolean(stored && stored.isConnected), sameNode: Boolean(stored && stored === current), presentNow: Boolean(current) };
    });
    return out;
  };

  var onBody = function () {
    if (!document.body) return;
    anchorObserver.observe(document.body, { childList: true });
    new MutationObserver(detectErrorUi).observe(document.body, { childList: true, subtree: true });
  };
  if (document.body) onBody(); else document.addEventListener("DOMContentLoaded", onBody, { once: true });

  // ------------------------------------------------------------------------------------------------
  // Windowed view and self-test (the self-test runs on the product-free seed page only)
  // ------------------------------------------------------------------------------------------------
  v.window = function (mark) {
    return {
      attempts: after(v.attempts, mark),
      storageDispatches: after(v.storageDispatches, mark),
      storageReceived: after(v.storageReceived, mark),
      locks: after(v.lockLog, mark),
      confirm: after(v.confirmLog, mark),
      events: after(v.events, mark),
      drags: after(v.drags, mark),
      network: after(v.network, mark),
      history: after(v.historyCalls, mark),
      pops: after(v.pops, mark),
      unload: after(v.unloadLog, mark),
      consoleErrors: after(v.consoleErrors, mark),
      errorUi: after(v.errorUi, mark),
    };
  };
  v.selfTest = async function selfTest() {
    var key = "xai_native_host_selftest";
    var out = {};
    var mark = v.mark();
    v.denySet(key);
    try { localStorage.setItem(key, "1"); out.setDeniedThrew = false; } catch (error) { out.setDeniedThrew = error instanceof DOMException && error.name === "SecurityError"; }
    out.setDeniedNeverStored = v.native.get(key) === null;
    v.restore();
    localStorage.setItem(key, "1");
    out.setDelegated = v.native.get(key) === "1";
    v.denySetValue(key, "true");
    try { localStorage.setItem(key, "true"); out.valueDeniedThrew = false; } catch (error) { out.valueDeniedThrew = error instanceof DOMException && error.name === "SecurityError"; }
    out.valueDeniedKeptBytes = v.native.get(key) === "1";
    localStorage.setItem(key, "false");
    out.otherValueDelegated = v.native.get(key) === "false";
    v.restore();
    v.uncertainSet(key);
    localStorage.setItem(key, "2");
    try { localStorage.getItem(key); out.readbackAfterSetDenied = false; } catch (error) { out.readbackAfterSetDenied = true; }
    out.readbackOneShot = localStorage.getItem(key) === "2";
    v.denyGet(key);
    try { localStorage.getItem(key); out.getDenied = false; } catch (error) { out.getDenied = true; }
    v.restore();
    v.denyRemove(key);
    try { localStorage.removeItem(key); out.removeDeniedThrew = false; } catch (error) { out.removeDeniedThrew = error instanceof DOMException && error.name === "SecurityError"; }
    out.removeDeniedKeptBytes = v.native.get(key) === "2";
    v.restore();
    localStorage.removeItem(key);
    out.removeDelegated = v.native.get(key) === null;
    v.denyAll();
    var total = { get: false, set: false, remove: false, key: false, length: false, clear: false };
    try { localStorage.getItem(key); } catch (error) { total.get = true; }
    try { localStorage.setItem(key, "x"); } catch (error) { total.set = true; }
    try { localStorage.removeItem(key); } catch (error) { total.remove = true; }
    try { localStorage.key(0); } catch (error) { total.key = true; }
    try { void localStorage.length; } catch (error) { total.length = true; }
    try { localStorage.clear(); } catch (error) { total.clear = true; }
    out.totalDenial = total;
    v.restore();
    out.attemptOutcomes = v.window(mark).attempts.filter(function (entry) { return entry.key === key && (entry.op === "set" || entry.op === "remove"); }).map(function (entry) { return entry.op + ":" + (entry.value === undefined ? "" : entry.value) + ":" + entry.outcome; });
    window.dispatchEvent(new StorageEvent("storage", { key: null, storageArea: localStorage }));
    window.dispatchEvent(new StorageEvent("storage", { key: key, storageArea: localStorage }));
    out.dispatchCounted = v.window(mark).storageDispatches.map(function (entry) { return String(entry.key) + ":" + entry.local; });
    out.deliveredCounted = v.window(mark).storageReceived.map(function (entry) { return String(entry.key) + ":" + entry.trusted; });
    var refused = false;
    try { await window.fetch("http://example.invalid/selftest"); } catch (error) { refused = true; }
    out.nonLocalFetchRefusedAndLogged = refused && v.window(mark).network.some(function (entry) { return entry.kind === "fetch" && !entry.local; });
    // Web Locks: a fixture hold makes an application request wait; a middle request queues behind it.
    var lockName = "xai-native-host-selftest-lock";
    await v.hold(lockName);
    var appRan = false;
    var appDone = navigator.locks.request(lockName, function () { appRan = true; });
    v.queueMiddle(lockName);
    await new Promise(function (resolve) { setTimeout(resolve, 30); });
    var during = await v.lockQuery();
    out.lockHeldAndPending = during.held.indexOf(lockName) !== -1 && during.pending.filter(function (name) { return name === lockName; }).length === 2 && !appRan;
    await v.release(lockName);
    await appDone;
    await new Promise(function (resolve) { setTimeout(resolve, 20); });
    out.appRanBeforeMiddle = appRan && v.middleAcquired(lockName) === true;
    await v.releaseMiddle(lockName);
    out.lockAttribution = v.window(mark).locks.filter(function (entry) { return entry.name === lockName; }).map(function (entry) { return entry.by; });
    // History wrapper (same URL, no new entry) and the unload-listener tracker.
    var historyBefore = v.historyCalls.length;
    history.replaceState({ key: "selftest", idx: 0, usr: { probe: 1 } }, "", location.pathname);
    var lastCall = v.historyCalls[v.historyCalls.length - 1];
    out.historyWrapperLogged = v.historyCalls.length === historyBefore + 1 && lastCall.method === "replaceState" && lastCall.key === "selftest" && lastCall.usr && lastCall.usr.probe === 1;
    protoReplace.call(history, null, "", location.pathname);
    out.unloadTracker = v.unloadSelfTest();
    // Export tracing.
    var urlBefore = v.urlTrace();
    var url = URL.createObjectURL(new Blob(["{}"], { type: "application/json" }));
    URL.revokeObjectURL(url);
    var urlAfter = v.urlTrace();
    out.urlTraced = urlAfter.createAttempts - urlBefore.createAttempts === 1 && urlAfter.created[urlAfter.created.length - 1] === url && urlAfter.revoked[urlAfter.revoked.length - 1] === url;
    // DOM observer, frames, error-element detector.
    v.startDom();
    var gate = document.createElement("main");
    gate.className = "account-data-gate";
    document.body.appendChild(gate);
    document.documentElement.setAttribute("data-native-selftest", "1");
    await new Promise(function (resolve) { setTimeout(resolve, 0); });
    gate.remove();
    document.documentElement.removeAttribute("data-native-selftest");
    var dom = v.stopDom();
    out.domGateAddedAndRemoved = dom.dom.some(function (entry) { return entry.kind === "added" && entry.what.indexOf("gate") !== -1; }) && dom.dom.some(function (entry) { return entry.kind === "removed" && entry.what.indexOf("gate") !== -1; });
    out.htmlAttributeLogged = dom.html.some(function (entry) { return entry.attribute === "data-native-selftest" && entry.now === "1"; });
    var errorsBefore = v.errorUi.length;
    var fake = document.createElement("main");
    fake.innerHTML = "<h1>Route Error (selftest)</h1><p>selftest</p>";
    document.body.appendChild(fake);
    await new Promise(function (resolve) { setTimeout(resolve, 0); });
    out.errorUiDetected = v.errorUi.length === errorsBefore + 1;
    fake.remove();
    await new Promise(function (resolve) { setTimeout(resolve, 0); });
    v.errorUi.length = errorsBefore;
    v.startFrames();
    await new Promise(function (resolve) { setTimeout(resolve, 250); });
    out.framesSampled = v.stopFrames().length;
    out.warnWithoutListener = v.warn();
    return out;
  };
  window.__native = v;
})();
