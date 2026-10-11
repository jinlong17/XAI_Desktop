/*
 * CP-APPRAIL-01 batch 61 (contract r1 §15 E9, E10, E11): page prelude for ./native-fixed-app.tsx, the production App
 * composition of the FIXED AppRail order caller (`xai_rail_order`) and, for the host rows h and k references, the same
 * composition bundled from the before revision 419e56d. Verification only: it repairs nothing and changes no product
 * file. It is a new file; ./native-before-prelude.js (batch 58, frozen) is read only and not modified. Its instruments
 * follow native-before-prelude.js (drag recorder, key audit, beforeunload census) and
 * ../web-appearance-recovery-native/native-host-retryall-prelude.js (history, export and lock instruments), both read,
 * neither imported nor modified.
 *
 * Served by ./verify-native-fixed.mjs as a classic script BEFORE the module bundle (and alone on the product-free seed
 * page), so every instrument exists before any product module evaluates. It defines window.__native:
 *   - one global sequence shared by every trace, windowed by a mark;
 *   - attempt-level Storage tracing: every getItem/setItem/removeItem/key/clear/length attempt is logged BEFORE any fault
 *     decision and before exactly one delegation. Faults: total denial; per-key get, set and remove denial (set denial
 *     with a chosen DOMException name: QuotaExceededError for a quota fault, SecurityError otherwise); a one-shot
 *     readback denial after the next successful set. A fault throws and never reaches storage. A depth counter proves
 *     that no instrument re-enters Storage (contract §12 F-B002 rule: record, then delegate exactly once). A fault plan
 *     installed with Page.addScriptToEvaluateOnNewDocument (window.__nativeFaultPlan) arms read faults before mount;
 *   - an EventTarget.prototype.dispatchEvent spy (StorageEvents dispatched by script on any target and `web:*` bus
 *     CustomEvents), recorded before delegation, and a first-registered window "storage" listener;
 *   - Web Lock tracing (application vs fixture), fixture exclusive requests by id (held, pending, released), so that a
 *     fixture "middle" request can queue behind the engine's own request for the same name; navigator.locks.query();
 *   - History tracing (pushState/replaceState, log then delegate) and popstate;
 *   - a census of window "beforeunload" listeners and a synthetic cancelable beforeunload whose handler storage attempts
 *     are counted;
 *   - export tracing (object URLs, the export anchor's click, its insertion and removal) with one-shot failure hooks;
 *   - a window.confirm recorder (the dialog itself stays native and is answered through CDP); network refusal;
 *   - PASSIVE capture-phase recorders (never preventDefault/stopPropagation, contract §6 item 8): click; keydown,
 *     keyup and keypress (the K-1 key audit); and dragstart, dragenter, dragover, dragleave, drop and dragend with
 *     isTrusted, a target descriptor and the rail order displayed at dispatch time (before any product handler runs);
 *     a MutationObserver that stamps every change of the displayed rail order with the sequence (D1 evidence);
 *   - a console.error trace and an error-UI trace (route error boundary);
 *   - read-only views of the rail, the Topbar and its two status slots, the rail-order status and panel, focus, the
 *     Features pane, the settings departure dialog, the DesktopPet and <html>.
 * Every instrument delegates to the native implementation; none schedules product work.
 */
(function installAppRailFixedPrelude() {
  "use strict";
  var v = {
    seq: 0,
    attempts: [],
    dispatches: [],
    storageReceived: [],
    network: [],
    lockLog: [],
    confirmLog: [],
    events: [],
    drags: [],
    railChanges: [],
    keys: [],
    history: [],
    pops: [],
    consoleErrors: [],
    errorUi: [],
    unloadLog: [],
    faults: { all: false, get: new Set(), set: new Map(), remove: new Set(), readbackOnNextSet: new Set(), readbackArmed: new Set() },
    nested: 0,
    depth: 0,
    ids: new WeakMap(),
    nextId: 0,
    router: null,
  };
  v.next = function next() { v.seq += 1; return v.seq; };
  v.mark = function mark() { return v.seq; };
  var after = function (list, mark) { return list.filter(function (entry) { return entry.seq > mark; }); };
  var DOWNLOAD = "rail-order-draft.json";
  var squash = function (text) { return String(text == null ? "" : text).replace(/\s+/g, " ").trim(); };
  var copy = function (value) { return JSON.parse(JSON.stringify(value === undefined ? null : value)); };
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
  var refuse = function (entry, outcome, name, message) {
    entry.outcome = outcome;
    throw new DOMException(message, name);
  };
  var faults = v.faults;
  proto.getItem = function getItem(key) {
    enter();
    try {
      var name = String(key);
      var entry = log("get", this, name);
      if (this === realLocal) {
        if (faults.all || faults.get.has(name)) refuse(entry, "denied", "SecurityError", "fixture denied read");
        if (faults.readbackArmed.has(name)) {
          faults.readbackArmed.delete(name);
          refuse(entry, "readback-denied", "SecurityError", "fixture denied readback");
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
      if (this === realLocal && faults.all) refuse(entry, "denied", "SecurityError", "fixture denied write");
      if (this === realLocal && faults.set.has(name)) {
        var kind = faults.set.get(name);
        refuse(entry, kind === "QuotaExceededError" ? "denied-quota" : "denied", kind, "fixture denied write");
      }
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
      if (this === realLocal && (faults.all || faults.remove.has(name))) refuse(entry, "denied", "SecurityError", "fixture denied remove");
      native.remove.call(this, key);
    } finally { leave(); }
  };
  proto.key = function key(index) {
    enter();
    try {
      var entry = log("key", this, null);
      if (this === realLocal && faults.all) refuse(entry, "denied", "SecurityError", "fixture denied key");
      return native.key.call(this, index);
    } finally { leave(); }
  };
  proto.clear = function clear() {
    enter();
    try {
      var entry = log("clear", this, null);
      if (this === realLocal && faults.all) refuse(entry, "denied", "SecurityError", "fixture denied clear");
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
        if (this === realLocal && faults.all) refuse(entry, "denied", "SecurityError", "fixture denied length");
        return lengthDescriptor.get.call(this);
      } finally { leave(); }
    },
  });
  // Uninstrumented access for the runner (seeding, physical byte reads); never counted.
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
  };
  var addAll = function (set, keys) { [].concat(keys).forEach(function (key) { set.add(String(key)); }); };
  v.denyAll = function () { faults.all = true; return true; };
  v.denyGet = function (keys) { addAll(faults.get, keys); return true; };
  v.allowGet = function (keys) { [].concat(keys).forEach(function (key) { faults.get.delete(String(key)); }); return true; };
  /** kind: "QuotaExceededError" (a quota fault) or "SecurityError" (a throwing setItem). */
  v.denySet = function (key, kind) { faults.set.set(String(key), kind === "QuotaExceededError" ? "QuotaExceededError" : "SecurityError"); return true; };
  v.allowSet = function (key) { faults.set.delete(String(key)); return true; };
  v.denyRemove = function (keys) { addAll(faults.remove, keys); return true; };
  v.uncertainSet = function (key) { faults.readbackOnNextSet.add(String(key)); return true; };
  v.restore = function () {
    faults.all = false;
    faults.get.clear();
    faults.set.clear();
    faults.remove.clear();
    faults.readbackOnNextSet.clear();
    faults.readbackArmed.clear();
    return true;
  };
  v.faultState = function () {
    var set = {};
    faults.set.forEach(function (kind, key) { set[key] = kind; });
    return { all: faults.all, get: Array.from(faults.get), set: set, remove: Array.from(faults.remove), readbackOnNextSet: Array.from(faults.readbackOnNextSet), readbackArmed: Array.from(faults.readbackArmed) };
  };
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
      v.dispatches.push({ seq: v.next(), kind: "bus", type: event.type });
    }
    return nativeDispatch.call(this, event);
  };
  window.addEventListener("storage", function (event) {
    v.storageReceived.push({ seq: v.next(), key: event.key, newValue: event.newValue, trusted: event.isTrusted, local: event.storageArea === realLocal });
  });

  // ------------------------------------------------------------------------------------------------
  // beforeunload listener census (wrappers record, then delegate; listeners are never called by the census)
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
  var protoPush = History.prototype.pushState;
  var protoReplace = History.prototype.replaceState;
  History.prototype.pushState = function pushState(state, unused, url) {
    v.history.push({ seq: v.next(), method: "pushState", url: String(url == null ? "" : url), key: keyOfState(state) });
    return protoPush.call(this, state, unused, url);
  };
  History.prototype.replaceState = function replaceState(state, unused, url) {
    v.history.push({ seq: v.next(), method: "replaceState", url: String(url == null ? "" : url), key: keyOfState(state) });
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
  // PASSIVE capture-phase recorders: click, keys (K-1 audit) and drags (never preventDefault/stopPropagation)
  // ------------------------------------------------------------------------------------------------
  var railOrderNow = function () {
    return Array.prototype.map.call(document.querySelectorAll(".app-rail .rail-items .rail-btn"), function (button) { return button.getAttribute("aria-label"); });
  };
  var describe = function (element) {
    if (!(element instanceof Element)) return { tag: element === document ? "document" : "none" };
    var control = element.closest('input,textarea,button,[role="switch"],[role="button"],[role="menuitemradio"],a,.list-row') || element;
    return {
      tag: control.tagName.toLowerCase(),
      label: control.getAttribute("aria-label"),
      testid: control.getAttribute("data-testid"),
      railButton: Boolean(control.closest(".app-rail .rail-items")) && control.classList.contains("rail-btn"),
      inRailItems: Boolean(element.closest(".app-rail .rail-items")),
      inRail: Boolean(element.closest(".app-rail")),
      editable: Boolean(element.isContentEditable || /^(INPUT|TEXTAREA)$/.test(element.tagName)),
      className: typeof control.className === "string" ? control.className.slice(0, 80) : "",
    };
  };
  document.addEventListener("click", function (event) {
    v.events.push({ seq: v.next(), type: "click", trusted: event.isTrusted, target: describe(event.target) });
  }, true);
  ["keydown", "keyup", "keypress"].forEach(function (type) {
    window.addEventListener(type, function (event) {
      v.keys.push({ seq: v.next(), type: type, trusted: event.isTrusted, key: event.key, code: event.code, keyCode: event.keyCode, repeat: event.repeat });
    }, true);
  });
  ["dragstart", "dragenter", "dragover", "dragleave", "drop", "dragend"].forEach(function (type) {
    window.addEventListener(type, function (event) {
      var transfer = event.dataTransfer;
      v.drags.push({
        seq: v.next(), type: type, trusted: event.isTrusted, target: describe(event.target),
        // The order displayed when the event is dispatched, before any product handler (capture phase on window).
        railAtDispatch: railOrderNow(),
        effectAllowed: transfer ? transfer.effectAllowed : null, dropEffect: transfer ? transfer.dropEffect : null,
        types: transfer ? Array.prototype.slice.call(transfer.types || []) : null,
      });
    }, true);
  });
  // D1 evidence: every change of the displayed rail order, sequence-stamped when the mutation is observed.
  var lastRail = null;
  var railObserver = new MutationObserver(function () {
    var now = railOrderNow();
    var text = JSON.stringify(now);
    if (text !== lastRail) {
      lastRail = text;
      v.railChanges.push({ seq: v.next(), rail: now });
    }
  });
  var observeRail = function () {
    if (!document.body) return;
    lastRail = JSON.stringify(railOrderNow());
    railObserver.observe(document.body, { childList: true, subtree: true });
  };
  if (document.body) observeRail(); else document.addEventListener("DOMContentLoaded", observeRail, { once: true });

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
  errorObserver.observe(document.documentElement, { childList: true, subtree: true });

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
    return squash((element.getAttribute && element.getAttribute("aria-label")) || element.textContent).slice(0, 160);
  };
  var visibleBox = function (element) {
    if (!element) return false;
    var style = getComputedStyle(element);
    var box = element.getBoundingClientRect();
    return style.display !== "none" && style.visibility !== "hidden" && box.width > 0 && box.height > 0;
  };
  v.rect = rect;
  v.rail = function () {
    return Array.prototype.map.call(document.querySelectorAll(".app-rail .rail-items .rail-btn"), function (button) {
      return { name: button.getAttribute("aria-label"), active: button.classList.contains("active"), dragging: button.classList.contains("dragging"), draggable: button.getAttribute("draggable") };
    });
  };
  v.railNames = railOrderNow;
  /** The rail-order status (contract §5 selectors, A8, §7 item 2), read-only. */
  v.railStatus = function () {
    var button = document.querySelector('[data-testid="rail-order-status"]');
    var panel = document.querySelector('[data-testid="rail-order-panel"]');
    var root = button ? button.closest(".rail-order-status") : null;
    var controls = document.querySelector(".topbar .topbar-controls");
    var text = button ? button.querySelector(".rail-order-status-text") : null;
    var message = panel ? panel.querySelector('[data-testid="rail-order-message"]') : null;
    var actions = panel ? Array.prototype.map.call(panel.querySelectorAll('[data-testid^="rail-order-"]'), function (element) {
      if (element.getAttribute("data-testid") === "rail-order-message") return null;
      return { testid: element.getAttribute("data-testid"), name: element.getAttribute("aria-label"), label: squash(element.textContent), ariaDisabled: element.getAttribute("aria-disabled"), disabled: element.hasAttribute("disabled"), tag: element.tagName.toLowerCase(), type: element.getAttribute("type") };
    }).filter(Boolean) : [];
    var extra = panel ? Array.prototype.filter.call(panel.querySelectorAll('[role="alert"],[role="status"]'), function (element) { return element !== message; }).map(function (element) { return { role: element.getAttribute("role"), text: squash(element.textContent) }; }) : [];
    return {
      present: Boolean(button),
      rootInControls: Boolean(root && controls && root.parentElement === controls),
      rootIsOneElement: Boolean(root && root.parentElement && root.parentElement.querySelectorAll(":scope > .rail-order-status").length === 1),
      name: button ? button.getAttribute("aria-label") : null,
      tag: button ? button.tagName.toLowerCase() : null,
      type: button ? button.getAttribute("type") : null,
      expanded: button ? button.getAttribute("aria-expanded") : null,
      controls: button ? button.getAttribute("aria-controls") : null,
      text: text ? squash(text.textContent) : null,
      textVisible: visibleBox(text),
      rect: rect(button),
      panel: panel ? {
        id: panel.id, role: panel.getAttribute("role"), label: panel.getAttribute("aria-label"), modal: panel.getAttribute("aria-modal"),
        followsButton: Boolean(button && (button.compareDocumentPosition(panel) & Node.DOCUMENT_POSITION_FOLLOWING)),
        inRoot: Boolean(root && root.contains(panel)),
        message: message ? { text: squash(message.textContent), role: message.getAttribute("role") } : null,
        extraLines: extra,
        actions: actions,
        rect: rect(panel),
      } : null,
    };
  };
  v.topbar = function () {
    var controls = document.querySelector(".topbar .topbar-controls");
    var appearance = document.querySelector('[data-testid="appearance-status"]');
    return {
      present: Boolean(document.querySelector("header.topbar")),
      controlsOrder: controls ? Array.prototype.map.call(controls.children, function (element) {
        if (element.classList && element.classList.contains("rail-order-status")) return "rail-order-status-root";
        return element.getAttribute("data-testid") || (typeof element.className === "string" ? element.className.trim().split(/\s+/)[0] : element.tagName.toLowerCase());
      }) : [],
      appearanceStatus: appearance ? { name: appearance.getAttribute("aria-label") } : null,
      popoverOpen: Boolean(document.querySelector('.topbar #topbar-pref-panel[role="dialog"]')),
    };
  };
  v.surfaces = function () {
    return {
      alerts: Array.prototype.map.call(document.querySelectorAll('[role="alert"], [role="status"]'), function (element) { return squash(element.textContent).slice(0, 160); }),
      text: squash(document.body ? document.body.innerText : "").slice(0, 6000),
    };
  };
  v.focus = function () {
    var element = document.activeElement;
    if (!element) return null;
    return {
      tag: element.tagName.toLowerCase(),
      testid: element.getAttribute ? element.getAttribute("data-testid") : null,
      name: nameOf(element),
      className: typeof element.className === "string" ? element.className.slice(0, 80) : "",
      isBody: element === document.body,
      isPrefTrigger: Boolean(element.classList && element.classList.contains("topbar-pref-trigger")),
    };
  };
  v.features = function () {
    var pane = document.querySelector('.settings-detail[data-pane="features"]');
    if (!pane) return null;
    return {
      switches: Array.prototype.map.call(pane.querySelectorAll("[data-feature-id]"), function (card) {
        var toggle = card.querySelector('[role="switch"]');
        var block = card.querySelector(".features-recovery-field");
        return { id: card.getAttribute("data-feature-id"), checked: toggle ? toggle.getAttribute("aria-checked") : null, recovery: block ? squash(block.textContent) : null };
      }),
      status: squash((pane.querySelector(".features-recovery-status") || {}).textContent),
    };
  };
  v.departureDialog = function () {
    var dialog = document.querySelector('.settings-departure-dialog[role="dialog"]');
    return dialog ? { label: dialog.getAttribute("aria-label"), text: squash((dialog.querySelector("p") || {}).textContent), buttons: Array.prototype.map.call(dialog.querySelectorAll("button"), function (button) { return squash(button.textContent); }), html: dialog.outerHTML } : null;
  };
  v.signOutDialogOpen = function () { var dialog = document.querySelector("dialog.xai-sign-out-dialog"); return Boolean(dialog && dialog.open); };
  v.avatarMenuOpen = function () { return Boolean(document.querySelector(".avatar-menu")); };
  v.gate = function () {
    var gate = document.querySelector(".account-data-gate");
    return gate ? { text: squash(gate.textContent).slice(0, 300) } : null;
  };
  v.html = function () {
    var html = document.documentElement;
    return { lang: html.getAttribute("lang"), theme: html.getAttribute("data-theme") };
  };
  v.petState = function () {
    var wrap = document.querySelector(".pet-wrap");
    return { present: Boolean(wrap), wrap: rect(wrap) };
  };
  v.path = function () { return location.pathname; };

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
      drags: after(v.drags, mark),
      railChanges: after(v.railChanges, mark),
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
    var key = "xai_native_apprail_fixed_selftest";
    var out = {};
    var mark = v.mark();
    var nestedBefore = v.nested;
    v.denySet(key, "QuotaExceededError");
    try { localStorage.setItem(key, "1"); out.quotaThrew = false; } catch (error) { out.quotaThrew = error instanceof DOMException && error.name === "QuotaExceededError"; }
    out.quotaNeverStored = v.native.get(key) === null;
    v.restore();
    v.denySet(key, "SecurityError");
    try { localStorage.setItem(key, "1"); out.throwingSetThrew = false; } catch (error) { out.throwingSetThrew = error instanceof DOMException && error.name === "SecurityError"; }
    out.throwingSetNeverStored = v.native.get(key) === null;
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
    out.dispatchCounted = v.window(mark).dispatches.map(function (entry) { return entry.kind === "storage" ? "storage:" + String(entry.key) + ":" + entry.onWindow : "bus:" + entry.type; });
    var refused = false;
    try { await window.fetch("http://example.invalid/selftest"); } catch (error) { refused = true; }
    out.nonLocalFetchRefusedAndLogged = refused && v.window(mark).network.some(function (entry) { return entry.kind === "fetch" && !entry.local; });
    var lockName = "xai-native-apprail-fixed-selftest-lock";
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
    var historyMark = v.mark();
    history.pushState({ key: "selftest-push" }, "", location.pathname + "#selftest-push");
    history.replaceState({ key: "selftest-replace" }, "", location.pathname + "#selftest-replace");
    var popped = new Promise(function (resolve) { window.addEventListener("popstate", function once() { window.removeEventListener("popstate", once); resolve(true); }); });
    history.back();
    await Promise.race([popped, new Promise(function (resolve) { setTimeout(resolve, 1000); })]);
    out.historyTraced = v.window(historyMark).history.map(function (entry) { return entry.method + ":" + entry.key; });
    out.popTraced = v.window(historyMark).pops.length;
    var probeListener = function (event) { event.preventDefault(); };
    window.addEventListener("beforeunload", probeListener);
    var withListener = v.warn();
    window.removeEventListener("beforeunload", probeListener);
    var withoutListener = v.warn();
    out.unloadTracked = withListener.warned === true && withListener.listeners === 1 && withoutListener.warned === false && withoutListener.listeners === 0;
    var urlBefore = v.urlTrace();
    var url = URL.createObjectURL(new Blob(["{}"], { type: "application/json" }));
    URL.revokeObjectURL(url);
    var urlAfter = v.urlTrace();
    out.urlTraced = urlAfter.createAttempts - urlBefore.createAttempts === 1 && urlAfter.created[urlAfter.created.length - 1] === url && urlAfter.revoked[urlAfter.revoked.length - 1] === url;
    out.confirmWrapped = window.confirm !== nativeConfirm && typeof nativeConfirm === "function";
    var errorsBefore = v.consoleErrors.length;
    console.error("native apprail prelude self-test error trace");
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
    out.untrustedClickTraced = (function () {
      var markInput = v.mark();
      var button = document.createElement("button");
      button.type = "button";
      button.textContent = "selftest";
      document.body.appendChild(button);
      button.click();
      button.remove();
      var seen = v.window(markInput).events.filter(function (entry) { return entry.type === "click"; });
      return seen.length === 1 && seen[0].trusted === false;
    })();
    out.untrustedDragTraced = (function () {
      var markDrag = v.mark();
      var target = document.createElement("div");
      document.body.appendChild(target);
      target.dispatchEvent(new DragEvent("dragover", { bubbles: true, cancelable: true }));
      target.remove();
      var seen = v.window(markDrag).drags;
      return seen.length === 1 && seen[0].type === "dragover" && seen[0].trusted === false && Array.isArray(seen[0].railAtDispatch);
    })();
    // D1 observer positive control: a synthetic rail-like list whose order changes is stamped once.
    out.railObserverTraced = await (function () {
      var markRail = v.mark();
      var aside = document.createElement("aside");
      aside.className = "app-rail";
      aside.innerHTML = '<div class="rail-items"><button class="rail-btn" aria-label="A"></button><button class="rail-btn" aria-label="B"></button></div>';
      document.body.appendChild(aside);
      return new Promise(function (resolve) { setTimeout(resolve, 0); }).then(function () {
        var items = aside.querySelector(".rail-items");
        items.insertBefore(items.lastElementChild, items.firstElementChild);
        return new Promise(function (resolve) { setTimeout(resolve, 0); });
      }).then(function () {
        aside.remove();
        return new Promise(function (resolve) { setTimeout(resolve, 0); });
      }).then(function () {
        var seen = v.window(markRail).railChanges.map(function (entry) { return entry.rail.join(","); });
        return seen.indexOf("B,A") !== -1;
      });
    })();
    return out;
  };
  window.__native = v;
})();
