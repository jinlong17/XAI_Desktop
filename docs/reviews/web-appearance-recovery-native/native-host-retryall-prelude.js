/*
 * CP-APPEARANCE-01 batch 45 (contract r3 §14 E12, E13, E26): page prelude for ./native-host-retryall-app.tsx, the
 * production App composition of the FIXED Appearance caller (and, for the E13 chrome-invariance comparison and the
 * row h sign-out comparison, the same composition bundled from 5cd63ff). Verification only: it repairs nothing and
 * changes no product file. It is a new file; ./native-fixed-prelude.js (batch 43) is not modified. Its instruments
 * are those of native-fixed-prelude.js plus the host-matrix instruments of
 * ../web-features-recovery-native/native-host-prelude.js (history and listener tracking), re-implemented here.
 *
 * Served by ./verify-native-host-retryall.mjs as a classic script BEFORE the module bundle (and alone on the
 * product-free seed page), so every instrument exists before any product module evaluates. It defines window.__native:
 *   - one global sequence shared by every trace (attempts, locks, events, history, router, frames), windowed by a mark;
 *   - attempt-level Storage tracing: every getItem/setItem/removeItem/key/clear/length attempt is logged BEFORE any fault
 *     decision and before exactly one delegation. Faults: total denial, per-key get/set/remove denial and a one-shot
 *     readback denial. A fault throws a SecurityError DOMException and never reaches storage. A depth counter proves
 *     that no instrument re-enters Storage (contract §12 F-B002 rule);
 *   - an EventTarget.prototype.dispatchEvent spy: every StorageEvent dispatched by script (any target) and every `web:*`
 *     event-bus CustomEvent, recorded before delegation; a first-registered window "storage" listener;
 *   - Web Lock tracing (application vs fixture), fixture exclusive requests by id (granted, pending, released), so that
 *     a fixture "middle" request can queue behind the engine's own request for the same name; navigator.locks.query();
 *   - History tracing: History.prototype.pushState/replaceState (log, then delegate) and popstate events;
 *   - `beforeunload` listener tracking on window (adds/removes, active count) and a synthetic cancelable beforeunload;
 *   - a key audit trace: window capture-phase keydown, keypress and keyup with isTrusted (contract-independent K-1 rule);
 *   - capture-phase traces of click, keydown and input events with a target descriptor;
 *   - a console.error trace and an error-UI trace (the production RouteErrorBoundary heading or React Router's default
 *     error element appearing anywhere in the document, sequence-stamped);
 *   - export tracing (object URLs, the export anchor's click, insertion and removal), a window.confirm recorder, network
 *     refusal of every non-local request;
 *   - read-only views of <html>, the Topbar and its status, the Appearance pane (rows, recovery blocks, status line,
 *     Retry all, Export, Discard all, Reset), focus, scroll positions, the route error boundary, the old footer UI;
 *   - armed DOM observers, element identity, and an armed requestAnimationFrame sampler (one probe per rendered frame).
 * Every instrument delegates to the native implementation; none schedules product work.
 */
(function installAppearanceHostRetryAllPrelude() {
  "use strict";
  var v = {
    docId: String(Date.now()) + "-" + String(Math.random()).slice(2, 10),
    seq: 0,
    attempts: [],
    dispatches: [],
    storageReceived: [],
    network: [],
    lockLog: [],
    confirmLog: [],
    events: [],
    keys: [],
    history: [],
    pops: [],
    consoleErrors: [],
    errorUi: [],
    unloadLog: [],
    frames: [],
    sampling: false,
    domLog: [],
    marked: {},
    faults: { all: false, get: new Set(), set: new Set(), remove: new Set(), readbackOnNextSet: new Set(), readbackOnNextRemove: new Set(), readbackArmed: new Set() },
    nested: 0,
    depth: 0,
    ids: new WeakMap(),
    nextId: 0,
    router: null,
  };
  v.next = function next() { v.seq += 1; return v.seq; };
  v.mark = function mark() { return v.seq; };
  var after = function (list, mark) { return list.filter(function (entry) { return entry.seq > mark; }); };
  var DOWNLOAD = "appearance-draft.json";
  var squash = function (text) { return String(text == null ? "" : text).replace(/\s+/g, " ").trim(); };
  /** Stable object ids (blockers, listeners). */
  v.idOf = function idOf(object) {
    if (!object || (typeof object !== "object" && typeof object !== "function")) return null;
    var id = v.ids.get(object);
    if (id === undefined) { v.nextId += 1; id = v.nextId; v.ids.set(object, id); }
    return id;
  };
  /** The production router's live blocker (the fixture assigns window.__native.router before RouterProvider renders). */
  v.liveBlocker = function liveBlocker() {
    var router = v.router;
    if (!router || !router.state || !router.state.blockers) return null;
    var last = null;
    router.state.blockers.forEach(function (blocker) { last = blocker; });
    return last ? { id: v.idOf(last), state: last.state } : null;
  };

  // ------------------------------------------------------------------------------------------------
  // Attempt-level Storage instrumentation (recorded BEFORE any fault decision; exactly one delegation)
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
  var enter = function () { if (v.depth > 0) v.nested += 1; v.depth += 1; };
  var leave = function () { v.depth -= 1; };
  var refuse = function (entry, outcome, message) {
    entry.outcome = outcome;
    throw new DOMException(message, "SecurityError");
  };
  var faults = v.faults;
  proto.getItem = function getItem(key) {
    enter();
    try {
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
    } finally { leave(); }
  };
  proto.setItem = function setItem(key, value) {
    enter();
    try {
      var name = String(key);
      var entry = log("set", this, name, String(value));
      if (this === realLocal && (faults.all || faults.set.has(name))) refuse(entry, "denied", "fixture denied write");
      native.set.call(this, key, value);
      if (this === realLocal && faults.readbackOnNextSet.has(name)) {
        faults.readbackOnNextSet.delete(name);
        faults.readbackArmed.add(name);
      }
    } finally { leave(); }
  };
  proto.removeItem = function removeItem(key) {
    enter();
    try {
      var name = String(key);
      var entry = log("remove", this, name);
      if (this === realLocal && (faults.all || faults.remove.has(name))) refuse(entry, "denied", "fixture denied remove");
      native.remove.call(this, key);
      if (this === realLocal && faults.readbackOnNextRemove.has(name)) {
        faults.readbackOnNextRemove.delete(name);
        faults.readbackArmed.add(name);
      }
    } finally { leave(); }
  };
  proto.key = function key(index) {
    enter();
    try {
      var entry = log("key", this, null);
      if (this === realLocal && faults.all) refuse(entry, "denied", "fixture denied key");
      return native.key.call(this, index);
    } finally { leave(); }
  };
  proto.clear = function clear() {
    enter();
    try {
      var entry = log("clear", this, null);
      if (this === realLocal && faults.all) refuse(entry, "denied", "fixture denied clear");
      native.clear.call(this);
    } finally { leave(); }
  };
  Object.defineProperty(proto, "length", {
    configurable: true,
    enumerable: lengthDescriptor.enumerable,
    get: function () {
      enter();
      try {
        var entry = log("length", this, null);
        if (this === realLocal && faults.all) refuse(entry, "denied", "fixture denied length");
        return lengthDescriptor.get.call(this);
      } finally { leave(); }
    },
  });
  // Uninstrumented access for the runner and the fixture (seeding, physical byte reads); never counted.
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
  v.allowSet = function (keys) { [].concat(keys).forEach(function (key) { faults.set.delete(String(key)); }); return true; };
  v.allowRemove = function (keys) { [].concat(keys).forEach(function (key) { faults.remove.delete(String(key)); }); return true; };
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
  v.probeStorage = function (key) {
    var before = v.attempts.length;
    var threw = false;
    try { window.localStorage.getItem(key || "xai_native_probe"); } catch (error) { threw = error instanceof DOMException && error.name === "SecurityError"; }
    var last = v.attempts[v.attempts.length - 1] || null;
    return { logged: v.attempts.length - before, threw: threw, last: last ? { op: last.op, key: last.key, outcome: last.outcome } : null };
  };
  // A fault plan installed before any page script (Page.addScriptToEvaluateOnNewDocument).
  var plan = window.__nativeFaultPlan;
  v.planApplied = null;
  if (plan && typeof plan === "object") {
    if (Array.isArray(plan.get)) addAll(faults.get, plan.get);
    v.planApplied = { get: Array.isArray(plan.get) ? plan.get.slice() : [] };
  }

  // ------------------------------------------------------------------------------------------------
  // dispatchEvent spy (StorageEvents and web:* bus events, any target) and delivered storage events
  // ------------------------------------------------------------------------------------------------
  var nativeDispatch = EventTarget.prototype.dispatchEvent;
  EventTarget.prototype.dispatchEvent = function dispatchEvent(event) {
    if (event instanceof StorageEvent) {
      v.dispatches.push({ seq: v.next(), kind: "storage", key: event.key, local: event.storageArea === realLocal, onWindow: this === window, trusted: event.isTrusted });
    } else if (event && typeof event.type === "string" && event.type.indexOf("web:") === 0) {
      v.dispatches.push({ seq: v.next(), kind: "bus", type: event.type, detail: (function () { try { return JSON.parse(JSON.stringify(event.detail === undefined ? null : event.detail)); } catch (error) { return null; } })() });
    }
    return nativeDispatch.call(this, event);
  };
  window.addEventListener("storage", function (event) {
    v.storageReceived.push({ seq: v.next(), key: event.key, newValue: event.newValue, trusted: event.isTrusted, local: event.storageArea === realLocal });
  });

  // ------------------------------------------------------------------------------------------------
  // beforeunload listener tracking on window (contract §7 item 3 / host row i)
  // ------------------------------------------------------------------------------------------------
  var unloadListeners = [];
  var captureOf = function (options) { return typeof options === "boolean" ? options : Boolean(options && options.capture); };
  var nativeAdd = EventTarget.prototype.addEventListener;
  var nativeRemove = EventTarget.prototype.removeEventListener;
  window.addEventListener = function addEventListener(type, listener, options) {
    if (type === "beforeunload" && listener) {
      var capture = captureOf(options);
      var exists = unloadListeners.some(function (entry) { return entry.listener === listener && entry.capture === capture; });
      if (!exists) unloadListeners.push({ listener: listener, capture: capture });
      v.unloadLog.push({ seq: v.next(), op: "add", id: v.idOf(listener), active: unloadListeners.length });
    }
    return nativeAdd.call(window, type, listener, options);
  };
  window.removeEventListener = function removeEventListener(type, listener, options) {
    if (type === "beforeunload" && listener) {
      var capture = captureOf(options);
      unloadListeners = unloadListeners.filter(function (entry) { return !(entry.listener === listener && entry.capture === capture); });
      v.unloadLog.push({ seq: v.next(), op: "remove", id: v.idOf(listener), active: unloadListeners.length });
    }
    return nativeRemove.call(window, type, listener, options);
  };
  v.unloadListeners = function () { return unloadListeners.length; };
  /** Synthetic cancelable beforeunload (BeforeUnloadEvent is not constructible); counts handler storage attempts. */
  v.warn = function () {
    var before = v.attempts.length;
    var event = new Event("beforeunload", { cancelable: true });
    window.dispatchEvent(event);
    return { warned: event.defaultPrevented, attempts: v.attempts.length - before, listeners: unloadListeners.length };
  };

  // ------------------------------------------------------------------------------------------------
  // History tracing: pushState/replaceState (log, then delegate) and popstate
  // ------------------------------------------------------------------------------------------------
  var keyOfState = function (state) { return state !== null && typeof state === "object" && typeof state.key === "string" ? state.key : null; };
  var usrOfState = function (state) { try { return state !== null && typeof state === "object" && "usr" in state ? JSON.parse(JSON.stringify(state.usr === undefined ? null : state.usr)) : null; } catch (error) { return null; } };
  var protoPush = History.prototype.pushState;
  var protoReplace = History.prototype.replaceState;
  History.prototype.pushState = function pushState(state, unused, url) {
    v.history.push({ seq: v.next(), method: "pushState", url: String(url == null ? "" : url), key: keyOfState(state), usr: usrOfState(state) });
    return protoPush.call(this, state, unused, url);
  };
  History.prototype.replaceState = function replaceState(state, unused, url) {
    v.history.push({ seq: v.next(), method: "replaceState", url: String(url == null ? "" : url), key: keyOfState(state), usr: usrOfState(state) });
    return protoReplace.call(this, state, unused, url);
  };
  window.addEventListener("popstate", function (event) {
    v.pops.push({ seq: v.next(), path: location.pathname, key: keyOfState(event.state) });
  });

  // ------------------------------------------------------------------------------------------------
  // Web Lock tracing; fixture exclusive requests by id (a held request, and "middle" requests queued behind it)
  // ------------------------------------------------------------------------------------------------
  var fixtureLocking = false;
  var requests = {};
  var nextRequest = 0;
  var byName = {};
  if (typeof LockManager !== "undefined" && LockManager.prototype.request) {
    var nativeRequest = LockManager.prototype.request;
    LockManager.prototype.request = function request(name) {
      var rest = Array.prototype.slice.call(arguments, 1);
      var options = rest.length > 1 && rest[0] !== null && typeof rest[0] === "object" ? rest[0] : {};
      v.lockLog.push({ seq: v.next(), name: String(name), mode: options.mode || "exclusive", by: fixtureLocking ? "fixture" : "app" });
      return nativeRequest.apply(this, arguments);
    };
  }
  /** Issues one fixture exclusive request for `name` and returns its id at once; it is "pending" until granted. */
  v.lockRequest = function (name) {
    nextRequest += 1;
    var id = "L" + nextRequest;
    var entry = { id: id, name: name, state: "pending", release: null, done: null };
    var gate = new Promise(function (resolve) { entry.release = resolve; });
    fixtureLocking = true;
    try {
      entry.done = navigator.locks.request(name, { mode: "exclusive" }, function () { entry.state = "held"; entry.grantedSeq = v.next(); return gate; });
    } finally { fixtureLocking = false; }
    entry.done.then(function () { entry.state = "released"; entry.releasedSeq = v.next(); });
    requests[id] = entry;
    return id;
  };
  v.lockRelease = function (id) {
    var entry = requests[id];
    if (!entry) return Promise.reject(new Error("unknown fixture lock request " + id));
    entry.release();
    return entry.done.then(function () { return id; });
  };
  v.lockStates = function () {
    var out = {};
    Object.keys(requests).forEach(function (id) { out[id] = { name: requests[id].name, state: requests[id].state }; });
    return out;
  };
  /** Holds `name` (one fixture request, awaited until granted). */
  v.hold = function (name) {
    if (byName[name]) return Promise.reject(new Error("fixture lock already held: " + name));
    var id = v.lockRequest(name);
    byName[name] = id;
    return new Promise(function (resolve) {
      var poll = function () { if (requests[id].state === "held") resolve(name); else setTimeout(poll, 5); };
      poll();
    });
  };
  v.release = function (name) {
    var id = byName[name];
    if (!id) return Promise.reject(new Error("fixture lock not held: " + name));
    delete byName[name];
    return v.lockRelease(id).then(function () { return name; });
  };
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
  var clickTrace = { attempts: 0, throws: 0, hrefs: [], downloads: [], connected: [] };
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
      if (this.download === DOWNLOAD) {
        clickTrace.attempts += 1;
        clickTrace.hrefs.push(this.href);
        clickTrace.downloads.push(this.getAttribute("download"));
        clickTrace.connected.push(this.isConnected);
        if (pendingFailure.click) {
          pendingFailure.click = false;
          clickTrace.throws += 1;
          throw new Error("fixture anchor click failure");
        }
      }
      return nativeClick.call(this);
    },
  });
  var recordAnchors = function (records) {
    records.forEach(function (record) {
      Array.prototype.forEach.call(record.addedNodes, function (node) { if (node instanceof HTMLAnchorElement && node.download === DOWNLOAD) anchorTrace.added.push({ href: node.href, download: node.getAttribute("download") }); });
      Array.prototype.forEach.call(record.removedNodes, function (node) { if (node instanceof HTMLAnchorElement && node.download === DOWNLOAD) anchorTrace.removed.push({ href: node.href, download: node.getAttribute("download") }); });
    });
  };
  var anchorObserver = new MutationObserver(recordAnchors);
  var observeBody = function () { if (document.body) anchorObserver.observe(document.body, { childList: true }); };
  if (document.body) observeBody(); else document.addEventListener("DOMContentLoaded", observeBody, { once: true });
  var copy = function (value) { return JSON.parse(JSON.stringify(value)); };
  v.urlTrace = function () { return copy(urlTrace); };
  v.clickTrace = function () { return copy(clickTrace); };
  v.anchorTrace = function () { recordAnchors(anchorObserver.takeRecords()); return copy(anchorTrace); };
  v.anchorsInDom = function () { return document.querySelectorAll('a[download="' + DOWNLOAD + '"]').length; };
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
  // Key audit (window, capture phase, first registered): every keydown, keypress and keyup
  // ------------------------------------------------------------------------------------------------
  ["keydown", "keypress", "keyup"].forEach(function (type) {
    window.addEventListener(type, function (event) {
      v.keys.push({ seq: v.next(), type: type, key: event.key, code: event.code, trusted: event.isTrusted, repeat: event.repeat });
    }, true);
  });

  // ------------------------------------------------------------------------------------------------
  // Trusted-input trace (capture phase): every click, keydown and input event with a target descriptor
  // ------------------------------------------------------------------------------------------------
  var describe = function (element) {
    if (!(element instanceof Element)) return { tag: "none" };
    var control = element.closest('input,button,[role="menuitemradio"],[role="button"],[role="switch"],a,.list-row') || element;
    var row = control.closest("[data-appearance-control]");
    var section = control.closest("section");
    return {
      tag: control.tagName.toLowerCase(),
      testid: control.getAttribute("data-testid"),
      role: control.getAttribute("role"),
      label: control.getAttribute("aria-label"),
      text: squash(control.textContent).slice(0, 60),
      type: control.getAttribute("type"),
      className: typeof control.className === "string" ? control.className.slice(0, 80) : "",
      control: row ? row.getAttribute("data-appearance-control") : null,
      recovery: control.closest("[data-appearance-recovery]") ? control.closest("[data-appearance-recovery]").getAttribute("data-appearance-recovery") : null,
      section: section ? section.getAttribute("aria-label") : null,
      value: control instanceof HTMLInputElement ? control.value : null,
      ariaDisabled: control.getAttribute("aria-disabled"),
    };
  };
  ["click", "keydown", "input"].forEach(function (type) {
    document.addEventListener(type, function (event) {
      var entry = { seq: v.next(), type: type, trusted: event.isTrusted, target: describe(event.target) };
      if (event instanceof KeyboardEvent) {
        entry.key = event.key;
        entry.code = event.code;
        entry.repeat = event.repeat;
      }
      v.events.push(entry);
    }, true);
  });

  // ------------------------------------------------------------------------------------------------
  // console.error trace and error-UI trace (route error boundary or React Router's default error element)
  // ------------------------------------------------------------------------------------------------
  var nativeConsoleError = console.error;
  console.error = function error() {
    var args = Array.prototype.slice.call(arguments);
    v.consoleErrors.push({ seq: v.next(), path: location.pathname, text: args.map(function (value) { return value instanceof Error ? value.name + ": " + value.message : String(value); }).join(" ").replace(/\s+/g, " ").slice(0, 300) });
    return nativeConsoleError.apply(console, args);
  };
  var routeError = function () {
    var heading = Array.prototype.find.call(document.querySelectorAll("h1, h2"), function (element) {
      var text = squash(element.textContent);
      return text.indexOf("Route Error") === 0 || text.indexOf("Unexpected Application Error") === 0;
    });
    if (!heading) return null;
    var main = heading.closest("main") || heading.parentElement;
    var paragraph = main ? main.querySelector("p") : null;
    return { heading: squash(heading.textContent), message: paragraph ? squash(paragraph.textContent) : null };
  };
  v.routeError = routeError;
  var errorShown = false;
  var errorObserver = new MutationObserver(function () {
    var found = routeError();
    if (found && !errorShown) {
      errorShown = true;
      v.errorUi.push({ seq: v.next(), path: location.pathname, heading: found.heading, message: found.message });
    } else if (!found) {
      errorShown = false;
    }
  });
  var observeErrors = function () { errorObserver.observe(document.documentElement, { childList: true, subtree: true }); };
  observeErrors();

  // ------------------------------------------------------------------------------------------------
  // Read-only views
  // ------------------------------------------------------------------------------------------------
  var round = function (value) { return Math.round(value * 100) / 100; };
  var rect = function (element) {
    if (!element) return null;
    var box = element.getBoundingClientRect();
    return { left: round(box.left), top: round(box.top), right: round(box.right), bottom: round(box.bottom), width: round(box.width), height: round(box.height) };
  };
  var nameOf = function (element) {
    if (!element) return null;
    return squash((element.getAttribute && element.getAttribute("aria-label")) || element.textContent).slice(0, 120);
  };
  v.rect = rect;
  v.uiLang = function () {
    var trigger = document.querySelector(".topbar .topbar-pref-trigger");
    if (trigger) return trigger.getAttribute("title") === "外观" ? "zh" : "en";
    var title = document.querySelector(".appearance-pane .pane-title");
    if (title) return squash(title.textContent) === "外观" ? "zh" : "en";
    return null;
  };
  v.html = function () {
    var html = document.documentElement;
    var app = document.querySelector(".app");
    return {
      theme: html.getAttribute("data-theme"),
      density: html.getAttribute("data-density"),
      fontSize: html.style.fontSize || null,
      accentHue: html.style.getPropertyValue("--accent-hue") || null,
      bgTone: html.getAttribute("data-bg-tone"),
      railPos: html.getAttribute("data-rail-pos"),
      appRailPos: app ? app.getAttribute("data-rail-pos") : null,
      lang: html.getAttribute("lang"),
      prefersDark: window.matchMedia("(prefers-color-scheme: dark)").matches,
    };
  };
  /** Every attribute of an element; `style` as a property -> value map (declaration order ignored). */
  v.attributes = function (selector) {
    var element = selector === ":root" ? document.documentElement : document.querySelector(selector);
    if (!element) return null;
    var out = {};
    Array.prototype.forEach.call(element.attributes, function (attribute) { if (attribute.name !== "style") out[attribute.name] = attribute.value; });
    var style = {};
    for (var index = 0; index < element.style.length; index += 1) {
      var property = element.style[index];
      style[property] = element.style.getPropertyValue(property) + (element.style.getPropertyPriority(property) ? " !" + element.style.getPropertyPriority(property) : "");
    }
    return { attributes: out, style: style, styleAttribute: element.hasAttribute("style") };
  };
  v.topbar = function () {
    var trigger = document.querySelector(".topbar .topbar-pref-trigger");
    var panel = document.querySelector('.topbar #topbar-pref-panel[role="dialog"]');
    var status = document.querySelector('[data-testid="appearance-status"]');
    var statusText = status ? status.querySelector(".appearance-status-text") : null;
    var summary = trigger ? trigger.querySelector(".topbar-pref-summary") : null;
    return {
      present: Boolean(document.querySelector("header.topbar")),
      summary: summary ? squash(summary.textContent) : null,
      summaryVisible: summary ? getComputedStyle(summary).display !== "none" && summary.getBoundingClientRect().width > 0 : false,
      open: Boolean(panel),
      options: panel ? Array.prototype.map.call(panel.querySelectorAll('[role="menuitemradio"]'), function (element) {
        var section = element.closest("section");
        return { section: section ? section.getAttribute("aria-label") : null, name: element.getAttribute("aria-label"), checked: element.getAttribute("aria-checked"), disabled: element.disabled || element.getAttribute("aria-disabled") === "true" };
      }) : null,
      status: status ? {
        name: status.getAttribute("aria-label"),
        text: statusText ? squash(statusText.textContent) : null,
        textVisible: statusText ? getComputedStyle(statusText).display !== "none" && statusText.getBoundingClientRect().width > 0 : false,
        tag: status.tagName.toLowerCase(),
        type: status.getAttribute("type"),
        inControls: Boolean(status.closest(".topbar .topbar-controls")),
        rect: rect(status),
      } : null,
      controlsOrder: Array.prototype.map.call(document.querySelectorAll(".topbar .topbar-controls > *"), function (element) {
        return element.getAttribute("data-testid") || (typeof element.className === "string" ? element.className.trim().split(/\s+/)[0] : element.tagName.toLowerCase());
      }),
    };
  };
  var paneRoot = function () { return document.querySelector('.settings-detail[data-pane="appearance"] .appearance-pane'); };
  var pick = function (list, ids) {
    var chosen = [];
    list.forEach(function (element, index) { if (element) chosen.push(ids[index]); });
    return chosen.length === 1 ? chosen[0] : chosen.length === 0 ? null : "multiple:" + chosen.join("|");
  };
  var classId = function (elements, prefix) {
    var ids = [];
    Array.prototype.forEach.call(elements, function (element) {
      var match = Array.prototype.find.call(element.classList, function (name) { return name.indexOf(prefix) === 0; });
      ids.push(match ? match.slice(prefix.length) : "?");
    });
    return ids.length === 1 ? ids[0] : ids.length === 0 ? null : "multiple:" + ids.join("|");
  };
  v.paneValues = function () {
    var pane = paneRoot();
    if (!pane) return null;
    var control = function (id) { return pane.querySelector('[data-appearance-control="' + id + '"]'); };
    var segs = function (id) { var root = control(id); return root ? Array.prototype.map.call(root.querySelectorAll("button"), function (button) { return button.getAttribute("aria-selected") === "true"; }) : []; };
    var themeCards = control("theme") ? control("theme").querySelectorAll(".theme-card.active .theme-preview") : [];
    var hue = control("accentHue") ? control("accentHue").querySelector('input[type="range"]') : null;
    var font = control("fontScale") ? control("fontScale").querySelector('input[type="range"]') : null;
    return {
      lang: pick(segs("lang"), ["en", "zh"]),
      theme: classId(themeCards, "tp-"),
      density: pick(segs("density"), ["comfortable", "compact"]),
      accentHue: hue ? Number(hue.value) : null,
      accentReadout: control("accentHue") ? squash((control("accentHue").querySelector(".slider-val") || {}).textContent) : null,
      bgTone: control("bgTone") ? classId(control("bgTone").querySelectorAll(".bg-tone-card.active"), "bgt-") : null,
      railPos: control("railPos") ? classId(control("railPos").querySelectorAll(".rail-pos-card.active"), "rp-") : null,
      fontScale: font ? Number(font.value) : null,
      fontReadout: control("fontScale") ? squash((control("fontScale").querySelector(".slider-val") || {}).textContent) : null,
    };
  };
  var OLD_NAMES = ["Save & apply", "保存生效", "Saved", "已保存"];
  /**
   * The retired shared footer anywhere in the document: its classes or test ids, a control named after the old
   * button or its flash, or a text node whose whole text is one of those names (contract §5 item 9 "No old button").
   */
  v.oldUi = function () {
    var found = [];
    Array.prototype.forEach.call(document.querySelectorAll(".pane-footer, .pane-save, .is-saved, [data-testid='settings-footer-save'], [data-testid='settings-footer-reset']"), function (element) {
      found.push("selector:" + (element.className || element.getAttribute("data-testid")));
    });
    Array.prototype.forEach.call(document.querySelectorAll("button, [role='button'], [role='menuitemradio'], a"), function (element) {
      var name = nameOf(element);
      if (OLD_NAMES.indexOf(name) !== -1) found.push("control:" + name);
    });
    var walker = document.createTreeWalker(document.body || document.documentElement, NodeFilter.SHOW_TEXT);
    for (var node = walker.nextNode(); node; node = walker.nextNode()) {
      var text = squash(node.nodeValue);
      if (OLD_NAMES.indexOf(text) !== -1) found.push("text:" + text);
    }
    return found;
  };
  v.pane = function () {
    var pane = paneRoot();
    if (!pane) return null;
    var line = pane.querySelector('[data-testid="appearance-status-line"]');
    var retryAll = pane.querySelector('[data-testid="appearance-retry-all"]');
    var exportButton = pane.querySelector('[data-testid="appearance-export-draft"]');
    var discardAll = pane.querySelector('[data-testid="appearance-discard-all"]');
    var reset = pane.querySelector('[data-testid="appearance-reset-defaults"]');
    var actions = pane.querySelector(".appearance-actions");
    var describedBy = retryAll ? retryAll.getAttribute("aria-describedby") : null;
    return {
      title: squash((pane.querySelector(".pane-title") || {}).textContent),
      rows: pane.querySelectorAll(".setting-row").length,
      values: v.paneValues(),
      recovery: Array.prototype.map.call(pane.querySelectorAll("[data-appearance-recovery]"), function (block) {
        var message = block.querySelector(".appearance-recovery-text");
        return {
          id: block.getAttribute("data-appearance-recovery"),
          text: message ? squash(message.textContent) : null,
          role: message ? message.getAttribute("role") : null,
          buttons: Array.prototype.map.call(block.querySelectorAll("button"), function (button) { return button.getAttribute("aria-label"); }),
        };
      }),
      statusLine: line ? { text: squash(line.textContent), role: line.getAttribute("role"), id: line.id, inActions: Boolean(line.closest(".appearance-actions")) } : null,
      retryAll: retryAll ? {
        text: squash(retryAll.textContent),
        ariaDisabled: retryAll.getAttribute("aria-disabled"),
        disabled: retryAll.hasAttribute("disabled"),
        describedBy: describedBy,
        describedByStatusLine: Boolean(describedBy && line && describedBy === line.id),
        type: retryAll.getAttribute("type"),
        tabIndex: retryAll.tabIndex,
        title: retryAll.getAttribute("title"),
        hidden: retryAll.hidden || retryAll.hasAttribute("inert") || retryAll.getAttribute("aria-hidden") === "true",
        pointerEvents: getComputedStyle(retryAll).pointerEvents,
        rect: rect(retryAll),
      } : null,
      exportButton: exportButton ? squash(exportButton.textContent) : null,
      discardAll: discardAll ? squash(discardAll.textContent) : null,
      reset: reset ? squash(reset.textContent) : null,
      actionButtons: actions ? Array.prototype.map.call(actions.querySelectorAll("button"), function (button) { return button.getAttribute("data-testid"); }) : [],
      oldFooter: Boolean(pane.querySelector(".pane-footer, .pane-save, [data-testid='settings-footer-save'], [data-testid='settings-footer-reset'], .is-saved"))
        || Array.prototype.some.call(pane.querySelectorAll("button"), function (button) { return OLD_NAMES.indexOf(nameOf(button)) !== -1; }),
    };
  };
  v.focus = function () {
    var element = document.activeElement;
    if (!element) return null;
    return {
      tag: element.tagName.toLowerCase(),
      testid: element.getAttribute ? element.getAttribute("data-testid") : null,
      name: nameOf(element),
      isBody: element === document.body,
      inPane: Boolean(element.closest && element.closest(".appearance-pane")),
      control: element.closest && element.closest("[data-appearance-control]") ? element.closest("[data-appearance-control]").getAttribute("data-appearance-control") : null,
      recovery: element.closest && element.closest("[data-appearance-recovery]") ? element.closest("[data-appearance-recovery]").getAttribute("data-appearance-recovery") : null,
      focusVisible: (function () { try { return element.matches(":focus-visible"); } catch (error) { return null; } })(),
    };
  };
  v.scroll = function () {
    var scroller = document.querySelector(".module-settings");
    var detail = document.querySelector(".settings-detail");
    return { x: window.scrollX, y: window.scrollY, settings: scroller ? scroller.scrollTop : null, detail: detail ? detail.scrollTop : null };
  };
  v.petState = function () {
    var wrap = document.querySelector(".pet-wrap");
    var body = wrap ? wrap.querySelector(".pet-body") : null;
    return { present: Boolean(wrap), transform: wrap ? wrap.style.transform || null : null, left: wrap ? wrap.style.left || null : null, top: wrap ? wrap.style.top || null : null,
      bodyClass: body ? body.className : null, wrap: rect(wrap) };
  };
  v.path = function () { return location.pathname; };
  /** Ids and state of the current history stack (Navigation API, when present). */
  v.navigationEntries = function () {
    try {
      if (!window.navigation || !window.navigation.entries) return null;
      return { index: window.navigation.currentEntry ? window.navigation.currentEntry.index : null, entries: window.navigation.entries().map(function (entry) { return { key: entry.key, id: entry.id, url: entry.url }; }) };
    } catch (error) { return null; }
  };

  // ------------------------------------------------------------------------------------------------
  // DOM observers, element identity and the frame sampler (armed)
  // ------------------------------------------------------------------------------------------------
  var WATCHED = [
    ["gate", ".account-data-gate"],
    ["app", ".app"],
    ["topbar", "header.topbar"],
    ["rail", ".app-rail"],
    ["pet", ".pet-wrap"],
    ["settingsShell", ".settings-shell"],
    ["sidebar", ".settings-sidebar"],
    ["detail", ".settings-detail"],
    ["pane", ".appearance-pane"],
    ["routeError", "main.host-page"],
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
  var SEVEN = ["xai_pref_lang", "xai_pref_theme", "xai_pref_density", "xai_pref_font_scale", "xai_accent_hue", "xai_rail_pos", "xai_bg_tone"];
  var frameProbe = function () {
    var pane = paneRoot();
    var values = pane ? v.paneValues() : null;
    var trigger = document.querySelector(".topbar .topbar-pref-trigger");
    var html = document.documentElement;
    var line = pane ? pane.querySelector('[data-testid="appearance-status-line"]') : null;
    var retryAll = pane ? pane.querySelector('[data-testid="appearance-retry-all"]') : null;
    var describedBy = retryAll ? retryAll.getAttribute("aria-describedby") : null;
    var active = document.activeElement;
    var oldUiPresent = Boolean(document.querySelector(".pane-footer, .pane-save, .is-saved, [data-testid='settings-footer-save']"));
    if (!oldUiPresent && pane) {
      oldUiPresent = Array.prototype.some.call(pane.querySelectorAll("button"), function (button) { return OLD_NAMES.indexOf(nameOf(button)) !== -1; });
    }
    return {
      uiLang: v.uiLang(),
      pane: values,
      summary: trigger ? squash((trigger.querySelector(".topbar-pref-summary") || {}).textContent) : null,
      checked: (function () {
        var panel = document.querySelector('.topbar #topbar-pref-panel[role="dialog"]');
        if (!panel) return null;
        return Array.prototype.filter.call(panel.querySelectorAll('[role="menuitemradio"]'), function (element) { return element.getAttribute("aria-checked") === "true"; }).map(function (element) { return element.getAttribute("aria-label"); });
      })(),
      htmlTheme: html.getAttribute("data-theme"),
      htmlDensity: html.getAttribute("data-density"),
      htmlAccent: html.style.getPropertyValue("--accent-hue") || null,
      htmlBgTone: html.getAttribute("data-bg-tone"),
      htmlRail: html.getAttribute("data-rail-pos"),
      htmlFont: html.style.fontSize || null,
      statusLine: line ? squash(line.textContent) : null,
      statusLineId: line ? line.id : null,
      recovery: pane ? Array.prototype.map.call(pane.querySelectorAll("[data-appearance-recovery]"), function (block) {
        var message = block.querySelector(".appearance-recovery-text");
        return block.getAttribute("data-appearance-recovery") + "=" + (message ? squash(message.textContent) : "");
      }) : [],
      recoveryBlocks: pane ? pane.querySelectorAll("[data-appearance-recovery]").length : 0,
      retryAll: retryAll ? {
        ariaDisabled: retryAll.getAttribute("aria-disabled"),
        disabledAttr: retryAll.hasAttribute("disabled"),
        describedBy: describedBy,
        describedByLine: Boolean(describedBy && line && describedBy === line.id),
        text: squash(retryAll.textContent),
      } : null,
      retryAllDisabled: retryAll ? retryAll.getAttribute("aria-disabled") === "true" : null,
      topbarStatus: Boolean(document.querySelector('[data-testid="appearance-status"]')),
      focus: active ? { testid: active.getAttribute ? active.getAttribute("data-testid") : null, isBody: active === document.body, tag: active.tagName.toLowerCase() } : null,
      bytes: v.native.bytes(SEVEN),
      oldUi: oldUiPresent,
      routeError: Boolean(routeError()),
      path: location.pathname,
    };
  };
  v.frameProbe = frameProbe;
  var sample = function (timestamp) {
    if (!v.sampling) return;
    var entry = frameProbe();
    entry.seq = v.next();
    entry.t = Math.round(timestamp * 10) / 10;
    v.frames.push(entry);
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
      dispatches: after(v.dispatches, mark),
      storageReceived: after(v.storageReceived, mark),
      locks: after(v.lockLog, mark),
      confirm: after(v.confirmLog, mark),
      events: after(v.events, mark),
      keys: after(v.keys, mark),
      history: after(v.history, mark),
      pops: after(v.pops, mark),
      consoleErrors: after(v.consoleErrors, mark),
      errorUi: after(v.errorUi, mark),
      unload: after(v.unloadLog, mark),
      network: after(v.network, mark),
      nested: v.nested,
    };
  };
  v.selfTest = async function selfTest() {
    var key = "xai_native_host_selftest";
    var out = {};
    var mark = v.mark();
    var nestedBefore = v.nested;
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
    out.noNestedStorageCalls = v.nested === nestedBefore;
    window.dispatchEvent(new StorageEvent("storage", { key: key, storageArea: localStorage }));
    var bus = new EventTarget();
    bus.dispatchEvent(new CustomEvent("web:settings:preference-changed", { detail: { key: "theme", value: "dark" } }));
    out.dispatchCounted = v.window(mark).dispatches.map(function (entry) { return entry.kind === "storage" ? "storage:" + String(entry.key) + ":" + entry.local + ":" + entry.onWindow : "bus:" + entry.type; });
    out.deliveredCounted = v.window(mark).storageReceived.map(function (entry) { return String(entry.key) + ":" + entry.trusted; });
    var refused = false;
    try { await window.fetch("http://example.invalid/selftest"); } catch (error) { refused = true; }
    out.nonLocalFetchRefusedAndLogged = refused && v.window(mark).network.some(function (entry) { return entry.kind === "fetch" && !entry.local; });
    // Web Locks: a fixture hold makes an application request wait; a fixture "middle" request queued after it runs
    // before a later application request; release lets everything run in FIFO order.
    var lockName = "xai-native-host-selftest-lock";
    await v.hold(lockName);
    var order = [];
    var appFirst = navigator.locks.request(lockName, function () { order.push("app1"); });
    var middle = v.lockRequest(lockName);
    var appSecond = navigator.locks.request(lockName, function () { order.push("app2"); });
    await new Promise(function (resolve) { setTimeout(resolve, 30); });
    var during = await v.lockQuery();
    out.lockHeldAndPending = during.held.indexOf(lockName) !== -1 && during.pending.filter(function (name) { return name === lockName; }).length === 3 && order.length === 0;
    await v.release(lockName);
    await appFirst;
    await new Promise(function (resolve) { setTimeout(resolve, 30); });
    out.middleHeldAfterFirst = v.lockStates()[middle].state === "held" && order.join(",") === "app1";
    await v.lockRelease(middle);
    await appSecond;
    out.fifoOrder = order.join(",");
    out.lockAttribution = v.window(mark).locks.filter(function (entry) { return entry.name === lockName; }).map(function (entry) { return entry.by; });
    // History: pushState/replaceState are traced and delegated; a same-document traversal fires popstate.
    var historyMark = v.mark();
    history.pushState({ key: "selftest-push" }, "", location.pathname + "#selftest-push");
    history.replaceState({ key: "selftest-replace" }, "", location.pathname + "#selftest-replace");
    var popped = new Promise(function (resolve) { window.addEventListener("popstate", function once() { window.removeEventListener("popstate", once); resolve(true); }); });
    history.back();
    await Promise.race([popped, new Promise(function (resolve) { setTimeout(resolve, 1000); })]);
    out.historyTraced = v.window(historyMark).history.map(function (entry) { return entry.method + ":" + entry.key; });
    out.popTraced = v.window(historyMark).pops.length;
    // beforeunload listener tracking.
    var probeListener = function (event) { event.preventDefault(); };
    window.addEventListener("beforeunload", probeListener);
    var withListener = v.warn();
    window.removeEventListener("beforeunload", probeListener);
    var withoutListener = v.warn();
    out.unloadTracked = withListener.warned === true && withListener.listeners === 1 && withoutListener.warned === false && withoutListener.listeners === 0;
    // Export tracing.
    var urlBefore = v.urlTrace();
    var url = URL.createObjectURL(new Blob(["{}"], { type: "application/json" }));
    URL.revokeObjectURL(url);
    var urlAfter = v.urlTrace();
    out.urlTraced = urlAfter.createAttempts - urlBefore.createAttempts === 1 && urlAfter.created[urlAfter.created.length - 1] === url && urlAfter.revoked[urlAfter.revoked.length - 1] === url;
    out.confirmWrapped = window.confirm !== nativeConfirm && typeof nativeConfirm === "function";
    // console.error and error-UI traces.
    var errorsBefore = v.consoleErrors.length;
    console.error("native host prelude self-test error trace");
    out.consoleErrorTraced = v.consoleErrors.length === errorsBefore + 1;
    var main = document.createElement("main");
    main.className = "host-page";
    main.innerHTML = "<h1>Route Error (selftest)</h1><p>probe</p>";
    var uiBefore = v.errorUi.length;
    document.body.appendChild(main);
    await new Promise(function (resolve) { setTimeout(resolve, 0); });
    out.errorUiTraced = v.errorUi.length === uiBefore + 1 && v.errorUi[v.errorUi.length - 1].heading === "Route Error (selftest)";
    main.remove();
    await new Promise(function (resolve) { setTimeout(resolve, 0); });
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
    out.inputTraced = (function () {
      var markInput = v.mark();
      var button = document.createElement("button");
      button.type = "button";
      button.textContent = "selftest";
      document.body.appendChild(button);
      button.click();
      button.remove();
      var seen = v.window(markInput).events.filter(function (entry) { return entry.type === "click" && entry.target.text === "selftest"; });
      return seen.length === 1 && seen[0].trusted === false;
    })();
    out.oldUiClean = v.oldUi().length === 0;
    return out;
  };
  window.__native = v;
})();
