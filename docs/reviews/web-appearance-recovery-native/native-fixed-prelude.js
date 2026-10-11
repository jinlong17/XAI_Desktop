/*
 * CP-APPEARANCE-01 batch 43 (contract r3 §14 E9, E10, E11): page prelude for ./native-fixed-app.tsx, the
 * production App composition of the FIXED Appearance caller. Verification only: it repairs nothing and changes
 * no product file. The before-stage ./native-prelude.js is not modified; this file extends its instruments for
 * the fixed stage, following ../web-features-recovery-native/native-fixed-prelude.js (E9–E11 precedent).
 *
 * Served by ./verify-native-fixed.mjs as a classic script BEFORE the module bundle (and alone on the product-free
 * seed page), so every instrument exists before any product module evaluates. It defines window.__native:
 *   - one global sequence shared by every trace, so attempts, locks, events and frames can be windowed by a mark;
 *   - attempt-level Storage tracing: every getItem/setItem/removeItem/key/clear/length attempt is logged BEFORE any
 *     fault decision and before exactly one delegation. Faults: total denial, per-key get/set/remove denial, and a
 *     one-shot readback denial (the next getItem of a key after its next successful setItem or removeItem throws).
 *     A fault throws a SecurityError DOMException and never reaches storage. A fault plan installed by the runner
 *     through Page.addScriptToEvaluateOnNewDocument (window.__nativeFaultPlan) arms per-key read faults before
 *     mount. A depth counter proves that no instrument re-enters Storage (contract §12 F-B002 rule);
 *   - an EventTarget.prototype.dispatchEvent spy (contract §10 item 7): every StorageEvent dispatched by script, on
 *     any target, and every `web:*` event-bus CustomEvent (the bus is a module-level EventTarget), recorded before
 *     delegation; and a first-registered window "storage" listener (every storage event actually delivered);
 *   - Web Lock tracing: every LockManager.request name is logged before delegation, attributed to the application
 *     or to the fixture; hold/release of a named exclusive lock; navigator.locks.query();
 *   - export tracing: URL.createObjectURL/revokeObjectURL, the export anchor's click (download
 *     "appearance-draft.json", its href and download attribute), its body insertion/removal, and one-shot
 *     createObjectURL or click failure hooks;
 *   - a window.confirm recorder (call and return are sequence-stamped; the dialog itself stays native);
 *   - network recorders (anything that is not same-origin is refused);
 *   - capture-phase traces of click, keydown and input events with isTrusted and a target descriptor;
 *   - read-only views of <html>, the Topbar quick switcher and its status, the Appearance pane (the seven rows,
 *     recovery blocks, status line, Retry all, Export, Discard all, Reset), focus, the route error boundary, the
 *     DesktopPet; a synthetic cancelable beforeunload (handler storage attempts counted);
 *   - armed DOM observers and element identity, and an armed requestAnimationFrame sampler (one probe per frame).
 * Every instrument delegates to the native implementation; none schedules product work.
 */
(function installAppearanceFixedPrelude() {
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
    frames: [],
    sampling: false,
    domLog: [],
    marked: {},
    faults: { all: false, get: new Set(), set: new Set(), remove: new Set(), readbackOnNextSet: new Set(), readbackOnNextRemove: new Set(), readbackArmed: new Set() },
    planApplied: null,
    nested: 0,
    depth: 0,
  };
  v.next = function next() { v.seq += 1; return v.seq; };
  v.mark = function mark() { return v.seq; };
  var after = function (list, mark) { return list.filter(function (entry) { return entry.seq > mark; }); };
  var DOWNLOAD = "appearance-draft.json";
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
  // Trusted-input trace (capture phase): every click, keydown and input event with a target descriptor
  // ------------------------------------------------------------------------------------------------
  var describe = function (element) {
    if (!(element instanceof Element)) return { tag: "none" };
    var control = element.closest('input,button,[role="menuitemradio"],[role="button"],a,.list-row') || element;
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
    };
  };
  ["click", "keydown", "input"].forEach(function (type) {
    document.addEventListener(type, function (event) {
      var entry = { seq: v.next(), type: type, trusted: event.isTrusted, target: describe(event.target) };
      if (event instanceof KeyboardEvent) {
        entry.key = event.key;
        entry.code = event.code;
        entry.keyCode = event.keyCode;
        entry.repeat = event.repeat;
        entry.composing = event.isComposing;
        entry.modifiers = (event.altKey ? "A" : "") + (event.ctrlKey ? "C" : "") + (event.metaKey ? "M" : "") + (event.shiftKey ? "S" : "");
        entry.t = Math.round(event.timeStamp);
      }
      v.events.push(entry);
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
  v.topbar = function () {
    var trigger = document.querySelector(".topbar .topbar-pref-trigger");
    var panel = document.querySelector('.topbar #topbar-pref-panel[role="dialog"]');
    var status = document.querySelector('[data-testid="appearance-status"]');
    var statusText = status ? status.querySelector(".appearance-status-text") : null;
    return {
      present: Boolean(document.querySelector("header.topbar")),
      summary: trigger ? squash((trigger.querySelector(".topbar-pref-summary") || {}).textContent) : null,
      open: Boolean(panel),
      options: panel ? Array.prototype.map.call(panel.querySelectorAll('[role="menuitemradio"]'), function (element) {
        var section = element.closest("section");
        return { section: section ? section.getAttribute("aria-label") : null, name: element.getAttribute("aria-label"), checked: element.getAttribute("aria-checked") };
      }) : null,
      status: status ? {
        name: status.getAttribute("aria-label"),
        text: statusText ? squash(statusText.textContent) : null,
        textVisible: statusText ? getComputedStyle(statusText).display !== "none" : false,
        tag: status.tagName.toLowerCase(),
        type: status.getAttribute("type"),
        inControls: Boolean(status.closest(".topbar .topbar-controls")),
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
      accentSlider: hue ? hue.value : null,
      accentReadout: control("accentHue") ? squash((control("accentHue").querySelector(".slider-val") || {}).textContent) : null,
      accentActive: control("accentHue") ? Array.prototype.map.call(control("accentHue").querySelectorAll(".accent-sw.active"), function (element) { return element.getAttribute("aria-label"); }) : [],
      bgTone: control("bgTone") ? classId(control("bgTone").querySelectorAll(".bg-tone-card.active"), "bgt-") : null,
      railPos: control("railPos") ? classId(control("railPos").querySelectorAll(".rail-pos-card.active"), "rp-") : null,
      fontScale: font ? Number(font.value) : null,
      fontSlider: font ? font.value : null,
      fontReadout: control("fontScale") ? squash((control("fontScale").querySelector(".slider-val") || {}).textContent) : null,
    };
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
    var OLD_NAMES = ["Save & apply", "保存生效", "Saved", "已保存"];
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
        hidden: retryAll.hidden || retryAll.hasAttribute("inert") || retryAll.getAttribute("aria-hidden") === "true",
      } : null,
      exportButton: exportButton ? squash(exportButton.textContent) : null,
      discardAll: discardAll ? squash(discardAll.textContent) : null,
      reset: reset ? squash(reset.textContent) : null,
      actionButtons: actions ? Array.prototype.map.call(actions.querySelectorAll("button"), function (button) { return button.getAttribute("data-testid"); }) : [],
      // The retired shared footer: its classes, its test ids, or a button named "Save & apply"/"保存生效"/"Saved"/"已保存".
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
    };
  };
  v.petState = function () {
    var wrap = document.querySelector(".pet-wrap");
    return { present: Boolean(wrap), wrap: rect(wrap) };
  };
  /** Synthetic cancelable beforeunload (BeforeUnloadEvent is not constructible); counts handler attempts. */
  v.warn = function () {
    var before = v.attempts.length;
    var event = new Event("beforeunload", { cancelable: true });
    window.dispatchEvent(event);
    return { warned: event.defaultPrevented, attempts: v.attempts.length - before };
  };
  /** Location facts from the DOM only (the fixture adds router facts). */
  v.path = function () { return location.pathname; };

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
  var frameProbe = function () {
    var pane = paneRoot();
    var values = pane ? v.paneValues() : null;
    var trigger = document.querySelector(".topbar .topbar-pref-trigger");
    var html = document.documentElement;
    var line = pane ? pane.querySelector('[data-testid="appearance-status-line"]') : null;
    var retryAll = pane ? pane.querySelector('[data-testid="appearance-retry-all"]') : null;
    return {
      uiLang: v.uiLang(),
      pane: values ? { lang: values.lang, theme: values.theme, density: values.density } : null,
      summary: trigger ? squash((trigger.querySelector(".topbar-pref-summary") || {}).textContent) : null,
      checked: (function () {
        var panel = document.querySelector('.topbar #topbar-pref-panel[role="dialog"]');
        if (!panel) return null;
        return Array.prototype.filter.call(panel.querySelectorAll('[role="menuitemradio"]'), function (element) { return element.getAttribute("aria-checked") === "true"; }).map(function (element) { return element.getAttribute("aria-label"); });
      })(),
      htmlTheme: html.getAttribute("data-theme"),
      htmlDensity: html.getAttribute("data-density"),
      statusLine: line ? squash(line.textContent) : null,
      recoveryBlocks: pane ? pane.querySelectorAll("[data-appearance-recovery]").length : 0,
      retryAllDisabled: retryAll ? retryAll.getAttribute("aria-disabled") === "true" : null,
      topbarStatus: Boolean(document.querySelector('[data-testid="appearance-status"]')),
      routeError: Boolean(routeError()),
    };
  };
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
      network: after(v.network, mark),
      nested: v.nested,
    };
  };
  v.selfTest = async function selfTest() {
    var key = "xai_native_fixed_selftest";
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
    out.probeUnderDenial = v.probeStorage(key);
    v.restore();
    out.attemptsLogged = v.window(mark).attempts.filter(function (entry) { return entry.key === key || entry.key === null; }).map(function (entry) { return entry.op + ":" + entry.outcome; });
    out.noNestedStorageCalls = v.nested === nestedBefore;
    window.dispatchEvent(new StorageEvent("storage", { key: null, storageArea: localStorage }));
    window.dispatchEvent(new StorageEvent("storage", { key: key, storageArea: localStorage }));
    var bus = new EventTarget();
    bus.dispatchEvent(new CustomEvent("web:settings:preference-changed", { detail: { key: "theme", value: "dark" } }));
    out.dispatchCounted = v.window(mark).dispatches.map(function (entry) { return entry.kind === "storage" ? "storage:" + String(entry.key) + ":" + entry.local + ":" + entry.onWindow : "bus:" + entry.type; });
    out.deliveredCounted = v.window(mark).storageReceived.map(function (entry) { return String(entry.key) + ":" + entry.trusted; });
    var refused = false;
    try { await window.fetch("http://example.invalid/selftest"); } catch (error) { refused = true; }
    out.nonLocalFetchRefusedAndLogged = refused && v.window(mark).network.some(function (entry) { return entry.kind === "fetch" && !entry.local; });
    // Web Locks: a fixture hold makes an application request wait; release lets it run.
    var lockName = "xai-native-appearance-selftest-lock";
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
    anchor.download = DOWNLOAD;
    document.body.appendChild(anchor);
    v.failNextClick();
    try { anchor.click(); out.clickFailureHook = false; } catch (error) { out.clickFailureHook = v.clickTrace().throws >= 1 && v.clickTrace().downloads.indexOf(DOWNLOAD) !== -1; }
    anchor.remove();
    await new Promise(function (resolve) { setTimeout(resolve, 0); });
    var anchors = v.anchorTrace();
    out.anchorAddedAndRemovedTraced = anchors.added.length >= 1 && anchors.removed.length >= 1 && v.anchorsInDom() === 0;
    out.pendingFailuresConsumed = !v.pendingFailures().create && !v.pendingFailures().click;
    // window.confirm recorder is installed (not invoked here: a native dialog would block the self-test).
    out.confirmWrapped = window.confirm !== nativeConfirm && typeof nativeConfirm === "function";
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
    return out;
  };
  window.__native = v;
})();
