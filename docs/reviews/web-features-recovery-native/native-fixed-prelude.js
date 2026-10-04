/*
 * CP-FEATURES-01 batch 27 (contract §14 E9, E10, E11): page prelude for ./native-fixed.tsx (production App
 * composition) and ./native-fixed-host.tsx (Settings host composition). Verification only: it repairs nothing
 * and changes no product file. The before-stage ./native-prelude.js is not modified; this file extends its
 * instruments for the fixed stage.
 *
 * Served by ./verify-native-fixed.mjs as a classic script BEFORE the module bundle (and alone on the seed page),
 * so every instrument exists before any product module evaluates. It defines window.__native:
 *   - one global sequence shared by every trace, so attempts, locks, events and frames can be windowed by a mark;
 *   - attempt-level Storage tracing: every getItem/setItem/removeItem/key/clear/length attempt is logged BEFORE
 *     any fault decision and before delegation. Faults: total denial, per-key get/set/remove denial, and one-shot
 *     readback denial (the next getItem of a key after its next successful setItem or removeItem throws). A fault
 *     throws a SecurityError DOMException and never reaches storage. A fault plan installed by the runner through
 *     Page.addScriptToEvaluateOnNewDocument (window.__nativeFaultPlan) arms per-key read faults before mount;
 *   - the instrumented window.dispatchEvent of contract §10 item 5 (every StorageEvent passed to it, with its
 *     key) and a first-registered window "storage" listener (every storage event actually delivered);
 *   - Web Lock tracing: every LockManager.request name is logged before delegation, attributed to the
 *     application or to the fixture; hold/release of a named exclusive lock (the fixtures pass the real
 *     prefMutationLockName of a Features key); navigator.locks.query();
 *   - export tracing: URL.createObjectURL/revokeObjectURL, the export anchor's click (download
 *     "features-draft.json"), its body insertion/removal, and one-shot createObjectURL or click failure hooks;
 *   - a window.confirm recorder (call and return are sequence-stamped; the dialog itself stays native);
 *   - network recorders (anything that is not same-origin is refused); armed DOM observers and element
 *     identity (account-gate screen, AppRail, DesktopPet, Settings shell/sidebar/detail, Features pane, .app);
 *     an armed requestAnimationFrame sampler; a capture-phase trusted-input trace;
 *   - read-only views of the Features pane, the departure dialog and a synthetic cancelable beforeunload.
 * Every instrument delegates to the native implementation; none schedules product work.
 */
(function installFeaturesFixedPrelude() {
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
    frames: [],
    sampling: false,
    domLog: [],
    marked: {},
    faults: { all: false, get: new Set(), set: new Set(), remove: new Set(), readbackOnNextSet: new Set(), readbackOnNextRemove: new Set(), readbackArmed: new Set() },
    planApplied: null,
  };
  v.next = function next() { v.seq += 1; return v.seq; };
  v.mark = function mark() { return v.seq; };
  var after = function (list, mark) { return list.filter(function (entry) { return entry.seq > mark; }); };
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
    var entry = log("set", this, name, String(value));
    if (this === realLocal && (faults.all || faults.set.has(name))) refuse(entry, "denied", "fixture denied write");
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
  v.uncertainSet = function (key) { faults.readbackOnNextSet.add(String(key)); return true; };
  v.uncertainRemove = function (key) { faults.readbackOnNextRemove.add(String(key)); return true; };
  v.restore = function () {
    faults.all = false;
    faults.get.clear();
    faults.set.clear();
    faults.remove.clear();
    faults.readbackOnNextSet.clear();
    faults.readbackOnNextRemove.clear();
    faults.readbackArmed.clear();
    return true;
  };
  v.faultState = function () {
    return {
      all: faults.all,
      get: Array.from(faults.get),
      set: Array.from(faults.set),
      remove: Array.from(faults.remove),
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
  window.addEventListener("storage", function (event) {
    v.storageReceived.push({ seq: v.next(), key: event.key, trusted: event.isTrusted, local: event.storageArea === realLocal, newValue: event.newValue });
  });

  // ------------------------------------------------------------------------------------------------
  // Web Lock tracing; fixture-held exclusive locks by name
  // ------------------------------------------------------------------------------------------------
  var fixtureLocking = false;
  var held = {};
  if (typeof LockManager !== "undefined" && LockManager.prototype.request) {
    var nativeRequest = LockManager.prototype.request;
    LockManager.prototype.request = function request(name) {
      var rest = Array.prototype.slice.call(arguments, 1);
      var options = rest.length > 1 && rest[0] !== null && typeof rest[0] === "object" ? rest[0] : {};
      v.lockLog.push({ seq: v.next(), name: String(name), mode: options.mode || "exclusive", by: fixtureLocking ? "fixture" : "app" });
      return nativeRequest.apply(this, arguments);
    };
  }
  v.hold = function (name) {
    if (held[name]) return Promise.reject(new Error("fixture lock already held: " + name));
    var release;
    var entered;
    var gate = new Promise(function (resolve) { release = resolve; });
    var ready = new Promise(function (resolve) { entered = resolve; });
    var done;
    fixtureLocking = true;
    try {
      done = navigator.locks.request(name, { mode: "exclusive" }, function () { entered(); return gate; });
    } finally {
      fixtureLocking = false;
    }
    held[name] = { release: release, done: done };
    return ready.then(function () { return name; });
  };
  v.release = function (name) {
    var lock = held[name];
    if (!lock) return Promise.reject(new Error("fixture lock not held: " + name));
    lock.release();
    return lock.done.then(function () { delete held[name]; return name; });
  };
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
  // Export tracing: object URLs, the export anchor's click, its DOM insertion/removal, failure hooks
  // ------------------------------------------------------------------------------------------------
  var urlTrace = { createAttempts: 0, createThrows: 0, created: [], revoked: [], blobs: [] };
  var clickTrace = { attempts: 0, throws: 0, hrefs: [] };
  var anchorTrace = { added: [], removed: [] };
  var pendingFailure = { create: false, click: false };
  var nativeCreate = URL.createObjectURL;
  var nativeRevoke = URL.revokeObjectURL;
  URL.createObjectURL = function createObjectURL(object) {
    urlTrace.createAttempts += 1;
    if (pendingFailure.create) {
      pendingFailure.create = false;
      urlTrace.createThrows += 1;
      throw new Error("fixture createObjectURL failure");
    }
    var url = nativeCreate.call(URL, object);
    urlTrace.created.push(url);
    if (object instanceof Blob) urlTrace.blobs.push({ size: object.size, type: object.type });
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
        if (pendingFailure.click) {
          pendingFailure.click = false;
          clickTrace.throws += 1;
          throw new Error("fixture anchor click failure");
        }
      }
      return nativeClick.call(this);
    },
  });
  var anchorObserver = new MutationObserver(function (records) {
    records.forEach(function (record) {
      Array.prototype.forEach.call(record.addedNodes, function (node) { if (node instanceof HTMLAnchorElement && node.download === FEATURES_DOWNLOAD) anchorTrace.added.push(node.href); });
      Array.prototype.forEach.call(record.removedNodes, function (node) { if (node instanceof HTMLAnchorElement && node.download === FEATURES_DOWNLOAD) anchorTrace.removed.push(node.href); });
    });
  });
  var observeBody = function () { if (document.body) anchorObserver.observe(document.body, { childList: true }); };
  if (document.body) observeBody(); else document.addEventListener("DOMContentLoaded", observeBody, { once: true });
  var copy = function (value) { return JSON.parse(JSON.stringify(value)); };
  v.urlTrace = function () { return copy(urlTrace); };
  v.clickTrace = function () { return copy(clickTrace); };
  v.anchorTrace = function () { handleAnchorRecords(); return copy(anchorTrace); };
  var handleAnchorRecords = function () {
    anchorObserver.takeRecords().forEach(function (record) {
      Array.prototype.forEach.call(record.addedNodes, function (node) { if (node instanceof HTMLAnchorElement && node.download === FEATURES_DOWNLOAD) anchorTrace.added.push(node.href); });
      Array.prototype.forEach.call(record.removedNodes, function (node) { if (node instanceof HTMLAnchorElement && node.download === FEATURES_DOWNLOAD) anchorTrace.removed.push(node.href); });
    });
  };
  v.anchorsInDom = function () { return document.querySelectorAll('a[download="' + FEATURES_DOWNLOAD + '"]').length; };
  v.failNextCreate = function () { pendingFailure.create = true; return true; };
  v.failNextClick = function () { pendingFailure.click = true; return true; };
  v.pendingFailures = function () { return { create: pendingFailure.create, click: pendingFailure.click }; };

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
  // Trusted-input trace (capture phase): Features pane, departure dialog, Settings sidebar, AppRail
  // ------------------------------------------------------------------------------------------------
  var describe = function (element) {
    var control = element && element.closest ? element.closest('[role="switch"],button,.list-row') : null;
    if (!control) return element && element.tagName ? element.tagName.toLowerCase() : "none";
    if (control.getAttribute("role") === "switch") {
      var card = control.closest("[data-feature-id]");
      return "switch:" + (card ? card.getAttribute("data-feature-id") : control.getAttribute("aria-label"));
    }
    if (control.classList.contains("list-row")) return "sidebar:" + (control.textContent || "").trim();
    return "button:" + ((control.getAttribute("aria-label") || control.textContent || "").replace(/\s+/g, " ").trim()).slice(0, 80);
  };
  ["click", "keydown"].forEach(function (type) {
    document.addEventListener(type, function (event) {
      var target = event.target;
      if (!(target instanceof Element) || !target.closest(".features-pane, .settings-departure-dialog, .settings-sidebar, .app-rail")) return;
      var entry = { seq: v.next(), type: type, trusted: event.isTrusted, target: describe(target) };
      if (event instanceof KeyboardEvent) entry.key = event.key;
      v.events.push(entry);
    }, true);
  });

  // ------------------------------------------------------------------------------------------------
  // Read-only views: Features pane, departure dialog, focus; synthetic cancelable beforeunload
  // ------------------------------------------------------------------------------------------------
  var text = function (element) { return element ? (element.textContent || "").replace(/\s+/g, " ").trim() : null; };
  var nameOf = function (button) { return ((button.getAttribute("aria-label") || button.textContent || "").replace(/\s+/g, " ").trim()); };
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
    var reset = pane.querySelectorAll('[data-testid="features-reset-defaults"]');
    return {
      switches: switches,
      recovery: recovery,
      status: status ? text(status) : null,
      statusRole: status ? status.getAttribute("role") : null,
      actions: actions ? { buttons: Array.prototype.map.call(actions.querySelectorAll("button"), nameOf), alert: alert ? text(alert) : null } : null,
      resetButtons: Array.prototype.map.call(reset, nameOf),
      saveFooter: Boolean(pane.querySelector(".pane-footer")) || Array.prototype.some.call(pane.querySelectorAll("button"), function (button) { return /Save & apply|保存并应用/.test(button.textContent || ""); }),
    };
  };
  v.dialog = function () {
    var dialog = document.querySelector('.settings-departure-dialog[role="dialog"]');
    if (!dialog) return null;
    return { label: dialog.getAttribute("aria-label"), text: text(dialog.querySelector("p")), buttons: Array.prototype.map.call(dialog.querySelectorAll("button"), function (button) { return text(button); }) };
  };
  v.focus = function () {
    var element = document.activeElement;
    if (!element) return null;
    return { tag: element.tagName.toLowerCase(), name: element.getAttribute ? (element.getAttribute("aria-label") || text(element) || "").slice(0, 60) : "", isBody: element === document.body, inPane: Boolean(element.closest && element.closest(".features-pane")) };
  };
  /** Synthetic cancelable beforeunload (BeforeUnloadEvent is not constructible); counts handler attempts. */
  v.warn = function () {
    var before = v.attempts.length;
    var event = new Event("beforeunload", { cancelable: true });
    window.dispatchEvent(event);
    return { warned: event.defaultPrevented, attempts: v.attempts.length - before };
  };

  // ------------------------------------------------------------------------------------------------
  // DOM observers, element identity and the frame sampler (armed)
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
  var treeObserver = new MutationObserver(handleRecords);
  v.startDom = function () { v.domLog = []; treeObserver.observe(document.body, { childList: true, subtree: true }); return true; };
  v.stopDom = function () { handleRecords(treeObserver.takeRecords()); treeObserver.disconnect(); return v.domLog.slice(); };
  v.peekDom = function () { handleRecords(treeObserver.takeRecords()); return v.domLog.slice(); };
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
  var sample = function (timestamp) {
    if (!v.sampling) return;
    var pane = document.querySelector(PANE);
    var status = pane ? pane.querySelector(".features-recovery-status") : null;
    v.frames.push({
      seq: v.next(),
      t: Math.round(timestamp * 10) / 10,
      gate: Boolean(document.querySelector(".account-data-gate")),
      pane: Boolean(pane),
      status: status ? text(status) : null,
      recoveryBlocks: pane ? pane.querySelectorAll(".features-recovery-field").length : 0,
    });
    requestAnimationFrame(sample);
  };
  v.startFrames = function () { v.frames = []; v.sampling = true; requestAnimationFrame(sample); return true; };
  v.stopFrames = function () { v.sampling = false; return v.frames.slice(); };

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
      network: after(v.network, mark),
    };
  };
  v.selfTest = async function selfTest() {
    var key = "xai_native_fixed_selftest";
    var out = {};
    var mark = v.mark();
    v.denySet(key);
    try { localStorage.setItem(key, "1"); out.setDeniedThrew = false; } catch (error) { out.setDeniedThrew = error instanceof DOMException && error.name === "SecurityError"; }
    out.setDeniedNeverStored = v.native.get(key) === null;
    v.restore();
    localStorage.setItem(key, "1");
    out.setDelegated = v.native.get(key) === "1";
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
    v.uncertainRemove(key);
    localStorage.removeItem(key);
    out.removeDelegated = v.native.get(key) === null;
    try { localStorage.getItem(key); out.readbackAfterRemoveDenied = false; } catch (error) { out.readbackAfterRemoveDenied = true; }
    v.restore();
    v.denyAll();
    var total = { get: false, set: false, remove: false, key: false, length: false, clear: false };
    try { localStorage.getItem(key); } catch (error) { total.get = true; }
    try { localStorage.setItem(key, "x"); } catch (error) { total.set = true; }
    try { localStorage.removeItem(key); } catch (error) { total.remove = true; }
    try { localStorage.key(0); } catch (error) { total.key = true; }
    try { void localStorage.length; } catch (error) { total.length = true; }
    try { localStorage.clear(); } catch (error) { total.clear = true; }
    out.totalDenial = total;
    out.probeUnderDenial = v.probe(key);
    v.restore();
    out.attemptsLogged = v.window(mark).attempts.filter(function (entry) { return entry.key === key || entry.key === null; }).map(function (entry) { return entry.op + ":" + entry.outcome; });
    window.dispatchEvent(new StorageEvent("storage", { key: null, storageArea: localStorage }));
    window.dispatchEvent(new StorageEvent("storage", { key: key, storageArea: localStorage }));
    out.dispatchCounted = v.window(mark).storageDispatches.map(function (entry) { return String(entry.key) + ":" + entry.local; });
    out.deliveredCounted = v.window(mark).storageReceived.map(function (entry) { return String(entry.key) + ":" + entry.trusted; });
    var refused = false;
    try { await window.fetch("http://example.invalid/selftest"); } catch (error) { refused = true; }
    out.nonLocalFetchRefusedAndLogged = refused && v.window(mark).network.some(function (entry) { return entry.kind === "fetch" && !entry.local; });
    // Web Locks: a fixture hold makes an application request wait; release lets it run.
    var lockName = "xai-native-fixed-selftest-lock";
    await v.hold(lockName);
    var appRan = false;
    var appDone = navigator.locks.request(lockName, function () { appRan = true; });
    await new Promise(function (resolve) { setTimeout(resolve, 30); });
    var during = await v.lockQuery();
    out.lockHeldAndPending = during.held.indexOf(lockName) !== -1 && during.pending.indexOf(lockName) !== -1 && !appRan;
    await v.release(lockName);
    await appDone;
    out.lockReleasedAppRan = appRan;
    out.lockAttribution = v.window(mark).locks.filter(function (entry) { return entry.name === lockName; }).map(function (entry) { return entry.by; });
    // Export tracing: one URL created and revoked; a failing anchor click is traced and never navigates.
    var urlBefore = v.urlTrace();
    var url = URL.createObjectURL(new Blob(["{}"], { type: "application/json" }));
    URL.revokeObjectURL(url);
    var urlAfter = v.urlTrace();
    out.urlTraced = urlAfter.createAttempts - urlBefore.createAttempts === 1 && urlAfter.created[urlAfter.created.length - 1] === url && urlAfter.revoked[urlAfter.revoked.length - 1] === url;
    v.failNextCreate();
    try { URL.createObjectURL(new Blob(["{}"])); out.createFailureHook = false; } catch (error) { out.createFailureHook = v.urlTrace().createThrows === urlAfter.createThrows + 1; }
    var anchor = document.createElement("a");
    anchor.href = "#selftest";
    anchor.download = FEATURES_DOWNLOAD;
    document.body.appendChild(anchor);
    v.failNextClick();
    try { anchor.click(); out.clickFailureHook = false; } catch (error) { out.clickFailureHook = v.clickTrace().throws >= 1; }
    anchor.remove();
    await new Promise(function (resolve) { setTimeout(resolve, 0); });
    var anchors = v.anchorTrace();
    out.anchorAddedAndRemovedTraced = anchors.added.length >= 1 && anchors.removed.length >= 1 && v.anchorsInDom() === 0;
    out.pendingFailuresConsumed = !v.pendingFailures().create && !v.pendingFailures().click;
    // DOM observer and frames.
    v.startDom();
    var gate = document.createElement("main");
    gate.className = "account-data-gate";
    document.body.appendChild(gate);
    await new Promise(function (resolve) { setTimeout(resolve, 0); });
    gate.remove();
    var dom = v.stopDom();
    out.domGateAddedAndRemoved = dom.some(function (entry) { return entry.kind === "added" && entry.what.indexOf("gate") !== -1; }) && dom.some(function (entry) { return entry.kind === "removed" && entry.what.indexOf("gate") !== -1; });
    v.startFrames();
    await new Promise(function (resolve) { setTimeout(resolve, 250); });
    out.framesSampled = v.stopFrames().length;
    out.warnWithoutListener = v.warn();
    return out;
  };
  window.__native = v;
})();
