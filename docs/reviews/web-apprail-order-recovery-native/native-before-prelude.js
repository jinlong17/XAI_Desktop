/*
 * CP-APPRAIL-01 batch 58 (contract r1 §12 "Native before", §15 E4): page prelude for ./native-before-app.tsx, the
 * production App composition of the AppRail order caller (`xai_rail_order`) at the BEFORE revision. Verification
 * only: it repairs nothing and changes no product file. It follows the instruments of
 * ../web-appearance-recovery-native/native-fixed-prelude.js (read, not imported or modified) and adds a passive drag
 * recorder, a passive key audit and a beforeunload listener census.
 *
 * Served by ./verify-native-before.mjs as a classic script BEFORE the module bundle (and alone on the product-free
 * seed page), so every instrument exists before any product module evaluates. It defines window.__native:
 *   - one global sequence shared by every trace, so attempts, locks, drags and events can be windowed by a mark;
 *   - attempt-level Storage tracing: every getItem/setItem/removeItem/key/clear/length attempt is logged BEFORE any
 *     fault decision and before exactly one delegation. Faults: total denial, per-key get denial, per-key set denial
 *     with a chosen DOMException name (QuotaExceededError for a quota fault, SecurityError for a throwing setItem),
 *     per-key remove denial. A fault throws and never reaches storage. A depth counter proves that no instrument
 *     re-enters Storage (contract §12 F-B002 rule: record, then delegate exactly once);
 *   - an EventTarget.prototype.dispatchEvent spy (StorageEvents dispatched by script on any target, and `web:*`
 *     event-bus CustomEvents), recorded before delegation, and a first-registered window "storage" listener;
 *   - Web Lock tracing: every LockManager.request name is logged before delegation, attributed to the application
 *     or to the fixture; fixture hold/release of a named exclusive lock; navigator.locks.query();
 *   - a window.confirm recorder (the dialog itself stays native and is answered through CDP);
 *   - a census of window "beforeunload" listeners (add/remove wrappers; the listeners themselves are untouched);
 *   - network recorders (anything that is not same-origin is refused and logged);
 *   - PASSIVE capture-phase recorders: click; keydown, keyup and keypress (the K-1 key audit); and dragstart,
 *     dragenter, dragover, dragleave, drop and dragend with isTrusted and a target descriptor. They never call
 *     preventDefault or stopPropagation (contract §6 item 8);
 *   - read-only views of the rail, the Topbar, the route error boundary, focus, <html> and the DesktopPet, and a
 *     synthetic cancelable beforeunload (BeforeUnloadEvent is not constructible) whose handler storage attempts are
 *     counted.
 * Every instrument delegates to the native implementation; none schedules product work.
 */
(function installAppRailBeforePrelude() {
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
    keys: [],
    unloadCensus: [],
    faults: { all: false, get: new Set(), set: new Map(), remove: new Set() },
    nested: 0,
    depth: 0,
  };
  v.next = function next() { v.seq += 1; return v.seq; };
  v.mark = function mark() { return v.seq; };
  var after = function (list, mark) { return list.filter(function (entry) { return entry.seq > mark; }); };
  var squash = function (text) { return String(text == null ? "" : text).replace(/\s+/g, " ").trim(); };

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
      if (this === realLocal && (faults.all || faults.get.has(name))) refuse(entry, "denied", "SecurityError", "fixture denied read");
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
        refuse(entry, kind === "QuotaExceededError" ? "denied-quota" : "denied-throw", kind, "fixture denied write");
      }
      native.set.call(this, key, value);
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
  v.denyAll = function () { faults.all = true; return true; };
  v.denyGet = function (key) { faults.get.add(String(key)); return true; };
  /** kind: "QuotaExceededError" (a quota fault) or "SecurityError" (a throwing setItem). */
  v.denySet = function (key, kind) { faults.set.set(String(key), kind === "QuotaExceededError" ? "QuotaExceededError" : "SecurityError"); return true; };
  v.denyRemove = function (key) { faults.remove.add(String(key)); return true; };
  v.restore = function () { faults.all = false; faults.get.clear(); faults.set.clear(); faults.remove.clear(); return true; };
  v.faultState = function () {
    var set = {};
    faults.set.forEach(function (kind, key) { set[key] = kind; });
    return { all: faults.all, get: Array.from(faults.get), set: set, remove: Array.from(faults.remove) };
  };

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
  var nativeAdd = window.addEventListener;
  var nativeRemove = window.removeEventListener;
  var liveUnload = [];
  window.addEventListener = function addEventListener(type, listener) {
    if (type === "beforeunload" && listener && liveUnload.indexOf(listener) === -1) {
      liveUnload.push(listener);
      v.unloadCensus.push({ seq: v.next(), op: "add", live: liveUnload.length });
    }
    return nativeAdd.apply(this, arguments);
  };
  window.removeEventListener = function removeEventListener(type, listener) {
    if (type === "beforeunload") {
      var index = liveUnload.indexOf(listener);
      if (index !== -1) liveUnload.splice(index, 1);
      v.unloadCensus.push({ seq: v.next(), op: "remove", live: liveUnload.length });
    }
    return nativeRemove.apply(this, arguments);
  };
  v.unloadListeners = function () { return liveUnload.length; };

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
  v.lockQuery = function () {
    return navigator.locks.query().then(function (snapshot) {
      return {
        held: (snapshot.held || []).map(function (lock) { return String(lock.name); }),
        pending: (snapshot.pending || []).map(function (lock) { return String(lock.name); }),
      };
    });
  };

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
  if (navigator.sendBeacon) navigator.sendBeacon = function sendBeacon(url) { netLog("beacon", url); return false; };

  // ------------------------------------------------------------------------------------------------
  // PASSIVE capture-phase recorders: click, keys (K-1 audit) and drags (never preventDefault/stopPropagation)
  // ------------------------------------------------------------------------------------------------
  var describe = function (element) {
    if (!(element instanceof Element)) return { tag: element === document ? "document" : "none" };
    var control = element.closest('input,textarea,button,[role="switch"],[role="menuitemradio"],a,.list-row') || element;
    return {
      tag: control.tagName.toLowerCase(),
      label: control.getAttribute("aria-label"),
      testid: control.getAttribute("data-testid"),
      railButton: Boolean(control.closest(".app-rail .rail-items")) && control.classList.contains("rail-btn"),
      inRailItems: Boolean(element.closest(".app-rail .rail-items")),
      inRail: Boolean(element.closest(".app-rail")),
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
        effectAllowed: transfer ? transfer.effectAllowed : null, dropEffect: transfer ? transfer.dropEffect : null,
        types: transfer ? Array.prototype.slice.call(transfer.types || []) : null,
      });
    }, true);
  });

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
  var routeError = function () {
    var heading = Array.prototype.find.call(document.querySelectorAll("main.host-page h1"), function (element) {
      return squash(element.textContent).indexOf("Route Error") === 0;
    });
    if (!heading) return null;
    var main = heading.closest("main");
    var paragraph = main ? main.querySelector("p") : null;
    return { heading: squash(heading.textContent), message: paragraph ? squash(paragraph.textContent) : null };
  };
  v.routeError = routeError;
  v.rect = rect;
  /** The rail module buttons in DOM order (accessible names and classes). */
  v.rail = function () {
    return Array.prototype.map.call(document.querySelectorAll(".app-rail .rail-items .rail-btn"), function (button) {
      return { name: button.getAttribute("aria-label"), active: button.classList.contains("active"), dragging: button.classList.contains("dragging"), draggable: button.getAttribute("draggable") };
    });
  };
  v.railNames = function () { return v.rail().map(function (entry) { return entry.name; }); };
  v.topbar = function () {
    var controls = document.querySelector(".topbar .topbar-controls");
    return {
      present: Boolean(document.querySelector("header.topbar")),
      controlsOrder: controls ? Array.prototype.map.call(controls.children, function (element) {
        return element.getAttribute("data-testid") || (typeof element.className === "string" ? element.className.trim().split(/\s+/)[0] : element.tagName.toLowerCase());
      }) : [],
      railOrderStatus: Boolean(document.querySelector('[data-testid="rail-order-status"]')),
      railOrderPanel: Boolean(document.querySelector('[data-testid="rail-order-panel"],#rail-order-panel')),
      railOrderActions: Array.prototype.map.call(document.querySelectorAll('[data-testid^="rail-order-"]'), function (element) { return element.getAttribute("data-testid"); }),
      appearanceStatus: Boolean(document.querySelector('[data-testid="appearance-status"]')),
      alertsInTopbar: Array.prototype.map.call(document.querySelectorAll('.topbar [role="alert"], .topbar [role="status"]'), function (element) { return squash(element.textContent).slice(0, 120); }),
    };
  };
  /** Every alert/status region and every button name in the document (used to prove absence of recovery UI). */
  v.surfaces = function () {
    return {
      alerts: Array.prototype.map.call(document.querySelectorAll('[role="alert"], [role="status"]'), function (element) { return squash(element.textContent).slice(0, 160); }),
      buttons: Array.prototype.map.call(document.querySelectorAll("button"), nameOf),
      text: squash(document.body ? document.body.innerText : "").slice(0, 4000),
    };
  };
  v.html = function () {
    var html = document.documentElement;
    var app = document.querySelector(".app");
    return { lang: html.getAttribute("lang"), theme: html.getAttribute("data-theme"), appRailPos: app ? app.getAttribute("data-rail-pos") : null };
  };
  v.focus = function () {
    var element = document.activeElement;
    if (!element) return null;
    return { tag: element.tagName.toLowerCase(), name: nameOf(element), isBody: element === document.body };
  };
  v.petState = function () {
    var wrap = document.querySelector(".pet-wrap");
    return { present: Boolean(wrap), wrap: rect(wrap) };
  };
  /** Synthetic cancelable beforeunload (BeforeUnloadEvent is not constructible); counts handler storage attempts. */
  v.warn = function () {
    var before = v.attempts.length;
    var event = new Event("beforeunload", { cancelable: true });
    window.dispatchEvent(event);
    return { warned: event.defaultPrevented, attempts: v.attempts.length - before, listeners: liveUnload.length };
  };

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
      keys: after(v.keys, mark),
      unloadCensus: after(v.unloadCensus, mark),
      network: after(v.network, mark),
      nested: v.nested,
    };
  };
  v.selfTest = async function selfTest() {
    var key = "xai_native_apprail_selftest";
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
    out.attemptsLogged = v.window(mark).attempts.filter(function (entry) { return entry.key === key; }).map(function (entry) { return entry.op + ":" + entry.outcome; });
    out.noNestedStorageCalls = v.nested === nestedBefore;
    window.dispatchEvent(new StorageEvent("storage", { key: key, storageArea: localStorage }));
    var bus = new EventTarget();
    bus.dispatchEvent(new CustomEvent("web:settings:preference-changed", { detail: { key: "theme", value: "dark" } }));
    out.dispatchCounted = v.window(mark).dispatches.map(function (entry) { return entry.kind === "storage" ? "storage:" + String(entry.key) + ":" + entry.onWindow : "bus:" + entry.type; });
    var refused = false;
    try { await window.fetch("http://example.invalid/selftest"); } catch (error) { refused = true; }
    out.nonLocalFetchRefusedAndLogged = refused && v.window(mark).network.some(function (entry) { return entry.kind === "fetch" && !entry.local; });
    var lockName = "xai-native-apprail-selftest-lock";
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
    out.confirmWrapped = window.confirm !== nativeConfirm && typeof nativeConfirm === "function";
    var listener = function (event) { event.preventDefault(); };
    window.addEventListener("beforeunload", listener);
    var warnedWith = v.warn();
    window.removeEventListener("beforeunload", listener);
    var warnedWithout = v.warn();
    out.unloadCensusAndWarn = warnedWith.warned === true && warnedWith.listeners === 1 && warnedWithout.warned === false && warnedWithout.listeners === 0;
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
      return seen.length === 1 && seen[0].type === "dragover" && seen[0].trusted === false;
    })();
    return out;
  };
  window.__native = v;
})();
