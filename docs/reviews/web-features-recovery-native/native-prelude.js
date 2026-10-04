/*
 * CP-FEATURES-01 batch 24 (contract §14 E4): page prelude for ./native-app.tsx. Verification only; it
 * repairs nothing and changes no product file.
 *
 * Served by ./verify-native-before.mjs as a classic script BEFORE the module bundle (and alone on the
 * seed page), so every instrument exists before any product module evaluates. It defines window.__native:
 *   - one global sequence shared by every trace, so attempts, events and frames can be windowed by a mark;
 *   - attempt-level Storage tracing: every getItem/setItem/removeItem/key/clear/length attempt is logged
 *     BEFORE any fault decision and before delegation; per-key setItem/removeItem faults throw a
 *     SecurityError DOMException and never reach storage;
 *   - the instrumented window.dispatchEvent required by contract §10 item 5: every StorageEvent passed to
 *     it is recorded (key, storage area) before delegation; a first-registered window "storage" listener
 *     records every storage event actually delivered (trusted or synthetic);
 *   - network recorders: fetch, XMLHttpRequest, WebSocket, EventSource and sendBeacon attempts are logged;
 *     anything that is not same-origin is refused (the runner also blocks DNS for every non-local host);
 *   - an armed requestAnimationFrame sampler: one probe of the displayed values per rendered frame;
 *   - armed DOM observers: <html> attribute changes with old values, and insertions/removals of the
 *     account-gate screen, AppRail, DesktopPet, Settings sidebar/detail and Features pane;
 *   - element-identity, focus, scroll and drag/click traces, and uninstrumented native storage access
 *     for the runner's own seeding and byte reads (never counted as application attempts).
 * Every instrument delegates to the native implementation; none schedules product work.
 */
(function installFeaturesNativePrelude() {
  "use strict";
  var v = {
    seq: 0,
    attempts: [],
    storageDispatches: [],
    storageReceived: [],
    network: [],
    frames: [],
    sampling: false,
    domLog: [],
    htmlLog: [],
    drags: [],
    clicks: [],
    marked: {},
    faults: { set: new Set(), remove: new Set() },
  };
  v.next = function next() { v.seq += 1; return v.seq; };
  v.mark = function mark() { return v.seq; };
  var after = function (list, mark) { return list.filter(function (entry) { return entry.seq > mark; }); };

  // ------------------------------------------------------------------------------------------------
  // Attempt-level Storage instrumentation
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
  proto.getItem = function getItem(key) {
    log("get", this, String(key));
    return native.get.call(this, key);
  };
  proto.setItem = function setItem(key, value) {
    var name = String(key);
    var entry = log("set", this, name, String(value));
    if (this === realLocal && v.faults.set.has(name)) {
      entry.outcome = "denied";
      throw new DOMException("fixture denied write", "SecurityError");
    }
    native.set.call(this, key, value);
  };
  proto.removeItem = function removeItem(key) {
    var name = String(key);
    var entry = log("remove", this, name);
    if (this === realLocal && v.faults.remove.has(name)) {
      entry.outcome = "denied";
      throw new DOMException("fixture denied remove", "SecurityError");
    }
    native.remove.call(this, key);
  };
  proto.key = function key(index) {
    log("key", this, null);
    return native.key.call(this, index);
  };
  proto.clear = function clear() {
    log("clear", this, null);
    native.clear.call(this);
  };
  Object.defineProperty(proto, "length", {
    configurable: true,
    enumerable: lengthDescriptor.enumerable,
    get: function () {
      log("length", this, null);
      return lengthDescriptor.get.call(this);
    },
  });
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
  v.denyRemove = function (key) { v.faults.remove.add(String(key)); };
  v.denySet = function (key) { v.faults.set.add(String(key)); };
  v.restore = function () { v.faults.set.clear(); v.faults.remove.clear(); };
  v.faultState = function () { return { set: Array.from(v.faults.set), remove: Array.from(v.faults.remove) }; };

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
    v.storageReceived.push({ seq: v.next(), key: event.key, trusted: event.isTrusted, local: event.storageArea === realLocal });
  });

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
  window.WebSocket = function WebSocket(url, protocols) {
    netLog("websocket", url);
    throw new TypeError("native fixture: WebSocket refused");
  };
  window.WebSocket.prototype = NativeSocket.prototype;
  var NativeEventSource = window.EventSource;
  window.EventSource = function EventSource(url) {
    netLog("eventsource", url);
    throw new TypeError("native fixture: EventSource refused");
  };
  window.EventSource.prototype = NativeEventSource.prototype;
  if (navigator.sendBeacon) {
    navigator.sendBeacon = function sendBeacon(url) { netLog("beacon", url); return false; };
  }

  // ------------------------------------------------------------------------------------------------
  // Display probes, per-frame sampler and full snapshot
  // ------------------------------------------------------------------------------------------------
  var labels = function (selector) {
    return Array.prototype.map.call(document.querySelectorAll(selector), function (element) {
      return element.getAttribute("aria-label");
    });
  };
  var rect = function (element) {
    if (!element) return null;
    var box = element.getBoundingClientRect();
    var round = function (value) { return Math.round(value * 100) / 100; };
    return { left: round(box.left), top: round(box.top), right: round(box.right), bottom: round(box.bottom), width: round(box.width), height: round(box.height) };
  };
  var fnv = function (text) {
    var hash = 0x811c9dc5;
    for (var index = 0; index < text.length; index += 1) {
      hash ^= text.charCodeAt(index);
      hash = Math.imul(hash, 0x01000193) >>> 0;
    }
    return ("00000000" + hash.toString(16)).slice(-8);
  };
  var petAnim = function (body) {
    if (!body) return null;
    return Array.prototype.find.call(body.classList, function (name) { return name.indexOf("pet-anim-") === 0; }) || null;
  };
  var switches = function () {
    return Array.prototype.map.call(document.querySelectorAll('.features-pane [data-feature-id] [role="switch"]'), function (element) {
      return element.closest("[data-feature-id]").getAttribute("data-feature-id") + "=" + element.getAttribute("aria-checked");
    });
  };
  v.probe = function probe() {
    var html = document.documentElement;
    var rail = document.querySelector(".app-rail");
    var pet = document.querySelector(".pet-wrap");
    var pane = document.querySelector(".features-pane");
    return {
      gate: Boolean(document.querySelector(".account-data-gate")),
      pane: Boolean(pane),
      notResetFeedback: Boolean(pane && /was not reset|未恢复默认/.test(pane.textContent || "")),
      hue: getComputedStyle(html).getPropertyValue("--accent-hue").trim(),
      tone: html.getAttribute("data-bg-tone"),
      railPos: html.getAttribute("data-rail-pos"),
      railDataPos: rail ? rail.getAttribute("data-pos") : null,
      rail: labels(".app-rail .rail-items .rail-btn").join("|"),
      petAnim: petAnim(pet && pet.querySelector(".pet-body")),
      petTransform: pet ? pet.style.transform : null,
      switches: switches().join(","),
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
      probe: v.probe(),
      computed: {
        accentHue: styles.getPropertyValue("--accent-hue").trim(),
        accent: styles.getPropertyValue("--accent").trim(),
        bgApp: styles.getPropertyValue("--bg-app").trim(),
        bodyBackground: getComputedStyle(document.body).backgroundColor,
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
      switches: switches(),
    };
  };
  var sample = function (timestamp) {
    if (!v.sampling) return;
    var entry = v.probe();
    entry.seq = v.next();
    entry.t = Math.round(timestamp * 10) / 10;
    v.frames.push(entry);
    requestAnimationFrame(sample);
  };
  v.startFrames = function () { v.frames = []; v.sampling = true; requestAnimationFrame(sample); return true; };
  v.stopFrames = function () { v.sampling = false; return v.frames.slice(); };

  // ------------------------------------------------------------------------------------------------
  // DOM observers (armed)
  // ------------------------------------------------------------------------------------------------
  var WATCHED = [
    ["gate", ".account-data-gate"],
    ["rail", ".app-rail"],
    ["pet", ".pet-wrap"],
    ["pane", ".features-pane"],
    ["detail", ".settings-detail"],
    ["sidebar", ".settings-sidebar"],
    ["shell", ".app"],
  ];
  var hits = function (node) {
    if (!(node instanceof Element)) return [];
    return WATCHED.filter(function (pair) { return node.matches(pair[1]) || node.querySelector(pair[1]) !== null; }).map(function (pair) { return pair[0]; });
  };
  // "old" is exact (attributeOldValue); "now" is the value when the observer callback ran (microtask).
  var handleRecords = function (records) {
    records.forEach(function (record) {
      if (record.type === "attributes") {
        v.htmlLog.push({ seq: v.next(), attribute: record.attributeName, old: record.oldValue, now: record.target.getAttribute(record.attributeName) });
        return;
      }
      Array.prototype.forEach.call(record.addedNodes, function (node) {
        var found = hits(node);
        if (found.length) {
          var entry = { seq: v.next(), kind: "added", what: found };
          if (found.indexOf("gate") !== -1) {
            var gate = node.matches(".account-data-gate") ? node : node.querySelector(".account-data-gate");
            entry.gateText = (gate.textContent || "").replace(/\s+/g, " ").trim().slice(0, 240);
          }
          v.domLog.push(entry);
        }
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

  // ------------------------------------------------------------------------------------------------
  // Element identity, focus and scroll
  // ------------------------------------------------------------------------------------------------
  v.markElements = function () {
    v.marked = {};
    WATCHED.forEach(function (pair) { v.marked[pair[0]] = document.querySelector(pair[1]); });
    v.marked.resetButton = document.querySelector("[data-native-target]");
    return Object.keys(v.marked).filter(function (name) { return v.marked[name] !== null; });
  };
  v.elementFates = function () {
    var out = {};
    WATCHED.concat([["resetButton", "[data-native-target]"]]).forEach(function (pair) {
      var stored = v.marked[pair[0]] || null;
      var current = document.querySelector(pair[1]);
      out[pair[0]] = { marked: Boolean(stored), connected: Boolean(stored && stored.isConnected), sameNode: Boolean(stored && stored === current), presentNow: Boolean(current) };
    });
    return out;
  };
  var describe = function (element) {
    if (!element) return null;
    return {
      tag: element.tagName.toLowerCase(),
      className: typeof element.className === "string" ? element.className.slice(0, 80) : "",
      name: ((element.getAttribute && element.getAttribute("aria-label")) || element.textContent || "").replace(/\s+/g, " ").trim().slice(0, 60),
      isBody: element === document.body,
    };
  };
  v.focus = function () { return describe(document.activeElement); };
  var selectorOf = function (element) {
    var classes = typeof element.className === "string" ? element.className.trim().split(/\s+/).filter(Boolean) : [];
    return element.tagName.toLowerCase() + classes.map(function (name) { return "." + CSS.escape(name); }).join("");
  };
  v.scrollAncestors = function (selector) {
    var element = document.querySelector(selector);
    var out = [];
    for (var node = element && element.parentElement; node; node = node.parentElement) {
      var style = getComputedStyle(node);
      if (/(auto|scroll)/.test(style.overflowY) && node.scrollHeight > node.clientHeight) {
        out.push({ selector: selectorOf(node), scrollTop: node.scrollTop, scrollHeight: node.scrollHeight, clientHeight: node.clientHeight });
      }
    }
    var root = document.scrollingElement;
    out.push({ selector: "document.scrollingElement", scrollTop: root ? root.scrollTop : null, scrollHeight: root ? root.scrollHeight : null, clientHeight: root ? root.clientHeight : null });
    return out;
  };
  v.scrollOf = function (selectors) {
    return selectors.map(function (selector) {
      var node = selector === "document.scrollingElement" ? document.scrollingElement : document.querySelector(selector);
      return { selector: selector, found: Boolean(node), scrollTop: node ? node.scrollTop : null };
    });
  };

  // ------------------------------------------------------------------------------------------------
  // Trusted input traces (capture phase)
  // ------------------------------------------------------------------------------------------------
  ["dragstart", "dragenter", "dragover", "drop", "dragend"].forEach(function (type) {
    document.addEventListener(type, function (event) {
      var button = event.target instanceof Element ? event.target.closest(".app-rail .rail-btn") : null;
      if (!button) return;
      v.drags.push({ seq: v.next(), type: type, trusted: event.isTrusted, target: button.getAttribute("aria-label") });
    }, true);
  });
  document.addEventListener("click", function (event) {
    var control = event.target instanceof Element ? event.target.closest("button,[role=switch]") : null;
    if (!control) return;
    v.clicks.push({ seq: v.next(), trusted: event.isTrusted, target: ((control.getAttribute("aria-label") || control.textContent || "").replace(/\s+/g, " ").trim()).slice(0, 60) });
  }, true);

  // ------------------------------------------------------------------------------------------------
  // Windowed views and self-test (run on the seed page only, never inside the application)
  // ------------------------------------------------------------------------------------------------
  v.window = function (mark) {
    return {
      attempts: after(v.attempts, mark).filter(function (entry) { return entry.op !== "get" && entry.op !== "length" && entry.op !== "key"; }),
      reads: after(v.attempts, mark).filter(function (entry) { return entry.op === "get"; }).length,
      storageDispatches: after(v.storageDispatches, mark),
      storageReceived: after(v.storageReceived, mark),
      network: after(v.network, mark),
      drags: after(v.drags, mark),
      clicks: after(v.clicks, mark),
    };
  };
  v.selfTest = async function selfTest() {
    var key = "xai_native_selftest";
    var out = {};
    var mark = v.mark();
    v.denySet(key);
    try { localStorage.setItem(key, "1"); out.setDeniedThrew = false; } catch (error) { out.setDeniedThrew = error instanceof DOMException && error.name === "SecurityError"; }
    out.setDeniedNeverStored = v.native.get(key) === null;
    v.restore();
    localStorage.setItem(key, "1");
    out.setDelegated = v.native.get(key) === "1";
    v.denyRemove(key);
    try { localStorage.removeItem(key); out.removeDeniedThrew = false; } catch (error) { out.removeDeniedThrew = error instanceof DOMException && error.name === "SecurityError"; }
    out.removeDeniedKeptBytes = v.native.get(key) === "1";
    v.restore();
    localStorage.removeItem(key);
    out.removeDelegated = v.native.get(key) === null;
    var attempts = v.window(mark).attempts.filter(function (entry) { return entry.key === key; });
    out.attemptsLogged = attempts.map(function (entry) { return entry.op + ":" + entry.outcome; });
    window.dispatchEvent(new StorageEvent("storage", { key: null, storageArea: localStorage }));
    window.dispatchEvent(new StorageEvent("storage", { key: key, storageArea: localStorage }));
    out.dispatchCounted = v.window(mark).storageDispatches.map(function (entry) { return String(entry.key) + ":" + entry.local; });
    out.deliveredCounted = v.window(mark).storageReceived.map(function (entry) { return String(entry.key) + ":" + entry.trusted; });
    var refused = false;
    try { await window.fetch("http://example.invalid/selftest"); } catch (error) { refused = true; }
    out.nonLocalFetchRefusedAndLogged = refused && v.window(mark).network.some(function (entry) { return entry.kind === "fetch" && !entry.local; });
    v.startDom();
    var gate = document.createElement("main");
    gate.className = "account-data-gate";
    gate.textContent = "selftest gate";
    document.body.appendChild(gate);
    document.documentElement.setAttribute("data-native-selftest", "1");
    await new Promise(function (resolve) { setTimeout(resolve, 0); });
    gate.remove();
    document.documentElement.removeAttribute("data-native-selftest");
    var dom = v.stopDom();
    out.domGateAddedAndRemoved = dom.dom.some(function (entry) { return entry.kind === "added" && entry.what.indexOf("gate") !== -1 && entry.gateText === "selftest gate"; })
      && dom.dom.some(function (entry) { return entry.kind === "removed" && entry.what.indexOf("gate") !== -1; });
    out.htmlAttributeLogged = dom.html.some(function (entry) { return entry.attribute === "data-native-selftest" && entry.now === "1"; });
    v.startFrames();
    await new Promise(function (resolve) { setTimeout(resolve, 250); });
    out.framesSampled = v.stopFrames().length;
    return out;
  };
  window.__native = v;
})();
