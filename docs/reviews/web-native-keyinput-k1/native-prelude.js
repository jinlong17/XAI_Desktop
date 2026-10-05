/*
 * CP-APPEARANCE-01 batch 39 (contract r3 §14 E4): page prelude for ./native-app.tsx. Verification only; it
 * repairs nothing and changes no product file.
 *
 * Served by ./verify-native-before.mjs as a classic script BEFORE the module bundle (and alone on the
 * product-free seed page), so every instrument exists before any product module evaluates. It defines
 * window.__native:
 *   - one global sequence shared by every trace, so attempts, events and frames can be windowed by a mark;
 *   - attempt-level Storage tracing: every getItem/setItem/removeItem/key/clear/length attempt is logged
 *     BEFORE any fault decision and before delegation. An armed per-key setItem fault throws a
 *     QuotaExceededError DOMException and an armed removeItem fault a SecurityError; neither reaches storage.
 *     Every instrument delegates to the captured native method exactly once and never re-enters Storage
 *     (contract §12 F-B002 rule); keys are compared as given, no product helper is called;
 *   - the instrumented window.dispatchEvent of contract §10 item 7 (every StorageEvent passed to it is
 *     recorded before delegation) and a first-registered window "storage" listener that records every storage
 *     event actually delivered to this document (trusted or synthetic);
 *   - network recorders: fetch, XMLHttpRequest, WebSocket, EventSource and sendBeacon attempts are logged and
 *     anything that is not same-origin is refused (the runner also blocks DNS for every non-local host);
 *   - read-only DOM probes of the Appearance surfaces (<html> attributes and inline style, .app, the Topbar
 *     quick switcher, the Settings Appearance pane, the shared footer, the DesktopPet, the route error
 *     boundary) and an armed requestAnimationFrame sampler (one probe per rendered frame);
 *   - armed DOM observers (<html> attribute changes with old values; insertion/removal of the account gate,
 *     .app, the Topbar, the Appearance pane, the DesktopPet and the route error boundary);
 *   - capture-phase traces of clicks, keydowns and focusin with isTrusted, and uninstrumented native storage
 *     access for the runner's own seeding and byte reads (never counted as application attempts).
 * No instrument schedules product work.
 */
(function installAppearanceNativePrelude() {
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
    clicks: [],
    keys: [],
    focusins: [],
    faults: { set: new Set(), remove: new Set() },
    nested: 0,
    depth: 0,
  };
  v.next = function next() { v.seq += 1; return v.seq; };
  v.mark = function mark() { return v.seq; };
  var after = function (list, mark) { return list.filter(function (entry) { return entry.seq > mark; }); };

  // ------------------------------------------------------------------------------------------------
  // Attempt-level Storage instrumentation (record, then fault decision, then exactly one delegation)
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
  proto.getItem = function getItem(key) {
    enter();
    try {
      log("get", this, String(key));
      return native.get.call(this, key);
    } finally { leave(); }
  };
  proto.setItem = function setItem(key, value) {
    enter();
    try {
      var name = String(key);
      var entry = log("set", this, name, String(value));
      if (this === realLocal && v.faults.set.has(name)) {
        entry.outcome = "denied";
        throw new DOMException("fixture denied write", "QuotaExceededError");
      }
      native.set.call(this, key, value);
    } finally { leave(); }
  };
  proto.removeItem = function removeItem(key) {
    enter();
    try {
      var name = String(key);
      var entry = log("remove", this, name);
      if (this === realLocal && v.faults.remove.has(name)) {
        entry.outcome = "denied";
        throw new DOMException("fixture denied remove", "SecurityError");
      }
      native.remove.call(this, key);
    } finally { leave(); }
  };
  proto.key = function key(index) {
    enter();
    try {
      log("key", this, null);
      return native.key.call(this, index);
    } finally { leave(); }
  };
  proto.clear = function clear() {
    enter();
    try {
      log("clear", this, null);
      native.clear.call(this);
    } finally { leave(); }
  };
  Object.defineProperty(proto, "length", {
    configurable: true,
    enumerable: lengthDescriptor.enumerable,
    get: function () {
      enter();
      try {
        log("length", this, null);
        return lengthDescriptor.get.call(this);
      } finally { leave(); }
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
  v.denySet = function (key) { v.faults.set.add(String(key)); return true; };
  v.denyRemove = function (key) { v.faults.remove.add(String(key)); return true; };
  v.allow = function (key) { v.faults.set.delete(String(key)); v.faults.remove.delete(String(key)); return true; };
  v.restore = function () { v.faults.set.clear(); v.faults.remove.clear(); return true; };
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
    v.storageReceived.push({ seq: v.next(), key: event.key, newValue: event.newValue, trusted: event.isTrusted, local: event.storageArea === realLocal });
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
  window.WebSocket = function WebSocket(url) {
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
  // Read-only DOM probes
  // ------------------------------------------------------------------------------------------------
  var squash = function (text) { return String(text || "").replace(/\s+/g, " ").trim(); };
  var round = function (value) { return Math.round(value * 100) / 100; };
  var rect = function (element) {
    if (!element) return null;
    var box = element.getBoundingClientRect();
    return { left: round(box.left), top: round(box.top), right: round(box.right), bottom: round(box.bottom), width: round(box.width), height: round(box.height) };
  };
  var nameOf = function (element) {
    if (!element) return null;
    return squash((element.getAttribute && element.getAttribute("aria-label")) || element.textContent).slice(0, 80);
  };
  var routeError = function () {
    var heading = Array.prototype.find.call(document.querySelectorAll("main.host-page h1"), function (element) {
      return squash(element.textContent).indexOf("Route Error") === 0;
    });
    if (!heading) return null;
    var main = heading.closest("main");
    var paragraph = main ? main.querySelector("p") : null;
    return { heading: squash(heading.textContent), message: paragraph ? squash(paragraph.textContent) : null, text: squash(main ? main.textContent : heading.textContent).slice(0, 400) };
  };
  var paneRoot = function () { return document.querySelector('.settings-detail[data-pane="appearance"] .appearance-pane'); };
  var rowOf = function (pane, label) {
    if (!pane) return null;
    return Array.prototype.find.call(pane.querySelectorAll(".setting-row"), function (row) {
      var labelNode = row.querySelector(".sr-label");
      return labelNode && squash(labelNode.textContent) === label;
    }) || null;
  };
  v.uiLang = function () {
    var trigger = document.querySelector(".topbar .topbar-pref-trigger");
    if (trigger) return trigger.getAttribute("title") === "外观" ? "zh" : "en";
    var title = document.querySelector(".appearance-pane .pane-title");
    if (title) return squash(title.textContent) === "外观" ? "zh" : "en";
    return null;
  };
  v.htmlState = function () {
    var html = document.documentElement;
    var app = document.querySelector(".app");
    return {
      theme: html.getAttribute("data-theme"),
      density: html.getAttribute("data-density"),
      fontSize: html.style.fontSize || null,
      accentHueInline: html.style.getPropertyValue("--accent-hue") || null,
      accentHueComputed: getComputedStyle(html).getPropertyValue("--accent-hue").trim() || null,
      bgTone: html.getAttribute("data-bg-tone"),
      railPos: html.getAttribute("data-rail-pos"),
      appRailPos: app ? app.getAttribute("data-rail-pos") : null,
      lang: html.getAttribute("lang"),
    };
  };
  v.topbarState = function () {
    var trigger = document.querySelector(".topbar .topbar-pref-trigger");
    var panel = document.querySelector('.topbar #topbar-pref-panel[role="dialog"]');
    var options = panel ? Array.prototype.map.call(panel.querySelectorAll('[role="menuitemradio"]'), function (element) {
      var section = element.closest("section");
      return { section: section ? section.getAttribute("aria-label") : null, name: element.getAttribute("aria-label"), checked: element.getAttribute("aria-checked") };
    }) : null;
    return {
      present: Boolean(document.querySelector("header.topbar")),
      triggerTitle: trigger ? trigger.getAttribute("title") : null,
      summary: trigger ? squash((trigger.querySelector(".topbar-pref-summary") || {}).textContent) : null,
      open: Boolean(panel),
      options: options,
      status: Boolean(document.querySelector('[data-testid="appearance-status"]')),
      controls: Array.prototype.map.call(document.querySelectorAll(".topbar .topbar-controls > *"), function (element) {
        return element.tagName.toLowerCase() + (typeof element.className === "string" && element.className ? "." + element.className.trim().split(/\s+/).join(".") : "") + (element.getAttribute("data-testid") ? "[data-testid=" + element.getAttribute("data-testid") + "]" : "");
      }),
    };
  };
  /** labels: { language, theme, density, accent, bg, rail, font } as displayed in the current language. */
  v.paneState = function (labels) {
    var pane = paneRoot();
    if (!pane) return { present: false };
    var out = { present: true, title: squash((pane.querySelector(".pane-title") || {}).textContent) };
    var selectedText = function (row) {
      if (!row) return null;
      var chosen = Array.prototype.filter.call(row.querySelectorAll(".seg button"), function (element) { return element.getAttribute("aria-selected") === "true"; });
      return chosen.length === 1 ? squash(chosen[0].textContent) : "selected:" + chosen.length;
    };
    var activeName = function (row, selector, nameSelector) {
      if (!row) return null;
      var chosen = Array.prototype.filter.call(row.querySelectorAll(selector), function (element) { return element.classList.contains("active"); });
      if (chosen.length !== 1) return "active:" + chosen.length;
      var target = nameSelector ? chosen[0].querySelector(nameSelector) : null;
      return target ? squash(target.textContent) : (chosen[0].getAttribute("aria-label") || squash(chosen[0].textContent));
    };
    var langRow = rowOf(pane, labels.language);
    var themeRow = rowOf(pane, labels.theme);
    var densityRow = rowOf(pane, labels.density);
    var accentRow = rowOf(pane, labels.accent);
    var bgRow = rowOf(pane, labels.bg);
    var railRow = rowOf(pane, labels.rail);
    var fontRow = rowOf(pane, labels.font);
    out.rowsFound = [langRow, themeRow, densityRow, accentRow, bgRow, railRow, fontRow].map(Boolean);
    out.lang = selectedText(langRow);
    out.theme = activeName(themeRow, ".theme-card", ".theme-label");
    out.density = selectedText(densityRow);
    out.accentSwatch = activeName(accentRow, ".accent-sw", null);
    var hue = accentRow ? accentRow.querySelector('input[type="range"]') : null;
    out.accentSlider = hue ? hue.value : null;
    out.accentReadout = accentRow ? squash((accentRow.querySelector(".slider-val") || {}).textContent) : null;
    out.bgTone = activeName(bgRow, ".bg-tone-card", null);
    out.railPos = activeName(railRow, ".rail-pos-card", ".rp-label");
    var font = fontRow ? fontRow.querySelector('input[type="range"]') : null;
    out.fontSlider = font ? font.value : null;
    out.fontReadout = fontRow ? squash((fontRow.querySelector(".slider-val") || {}).textContent) : null;
    var save = pane.querySelector('[data-testid="settings-footer-save"]');
    var reset = pane.querySelector('[data-testid="settings-footer-reset"]');
    out.footer = {
      present: Boolean(pane.querySelector(".pane-footer")),
      save: save ? { text: squash(save.textContent), className: save.className, disabled: save.hasAttribute("disabled"), ariaDisabled: save.getAttribute("aria-disabled"), describedBy: save.getAttribute("aria-describedby") } : null,
      reset: reset ? { text: squash(reset.textContent), className: reset.className } : null,
    };
    out.buttons = Array.prototype.map.call(pane.querySelectorAll("button"), nameOf);
    return out;
  };
  /** Every failure-feedback surface the contract fixes (§5 selectors and wording) or that could exist. */
  v.feedback = function () {
    var body = squash(document.body ? document.body.innerText : "");
    var all = Array.prototype.map.call(document.querySelectorAll('[role="alert"],[role="status"]'), function (element) { return squash(element.textContent).slice(0, 160); });
    var alerts = Array.prototype.map.call(document.querySelectorAll('[role="alert"]'), function (element) { return squash(element.textContent).slice(0, 160); });
    var retryButtons = Array.prototype.map.call(document.querySelectorAll("button"), nameOf).filter(function (name) { return /^(Retry|重试|全部重试)/.test(name || ""); });
    return {
      topbarStatus: Boolean(document.querySelector('[data-testid="appearance-status"]')),
      recoveryBlocks: document.querySelectorAll("[data-appearance-recovery]").length,
      statusLine: (function () { var line = document.querySelector('[data-testid="appearance-status-line"]'); return line ? squash(line.textContent) : null; })(),
      retryAll: Boolean(document.querySelector('[data-testid="appearance-retry-all"]')),
      alertsAndStatuses: all,
      alerts: alerts,
      retryButtons: retryButtons,
      notSavedText: /not saved|未保存|is saving|正在保存/i.test(body),
    };
  };
  v.petState = function () {
    var wrap = document.querySelector(".pet-wrap");
    var swap = document.querySelector(".pet-swap-btn");
    var bubble = document.querySelector(".pet-bubble");
    var swapVisible = Boolean(swap) && getComputedStyle(swap).display !== "none" && getComputedStyle(swap).visibility !== "hidden";
    return {
      present: Boolean(wrap),
      wrap: rect(wrap),
      transform: wrap ? wrap.style.transform : null,
      swap: swapVisible ? rect(swap) : null,
      bubble: bubble ? { rect: rect(bubble), pointerEvents: getComputedStyle(bubble).pointerEvents } : null,
      hovered: Boolean(wrap && wrap.matches(":hover")),
      focusWithin: Boolean(wrap && wrap.matches(":focus-within")),
    };
  };
  v.probe = function (labels) {
    return {
      routeError: routeError(),
      gate: Boolean(document.querySelector(".account-data-gate")),
      app: Boolean(document.querySelector(".app")),
      uiLang: v.uiLang(),
      html: v.htmlState(),
      topbar: v.topbarState(),
      pane: labels ? v.paneState(labels) : { present: Boolean(paneRoot()) },
      feedback: v.feedback(),
      pet: v.petState(),
      path: location.pathname,
    };
  };
  v.routeError = routeError;
  v.rect = rect;

  // ------------------------------------------------------------------------------------------------
  // Per-frame sampler (armed)
  // ------------------------------------------------------------------------------------------------
  var frameProbe = function () {
    var save = document.querySelector('[data-testid="settings-footer-save"]');
    var html = document.documentElement;
    return {
      save: save ? squash(save.textContent) : null,
      saved: Boolean(save && save.classList.contains("is-saved")),
      theme: html.getAttribute("data-theme"),
      density: html.getAttribute("data-density"),
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
  // DOM observers (armed)
  // ------------------------------------------------------------------------------------------------
  var WATCHED = [
    ["gate", ".account-data-gate"],
    ["app", ".app"],
    ["topbar", "header.topbar"],
    ["pane", ".appearance-pane"],
    ["pet", ".pet-wrap"],
    ["routeError", "main.host-page"],
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

  // ------------------------------------------------------------------------------------------------
  // Focus and trusted input traces (capture phase)
  // ------------------------------------------------------------------------------------------------
  var describe = function (element) {
    if (!element) return null;
    return {
      tag: element.tagName.toLowerCase(),
      className: typeof element.className === "string" ? element.className.slice(0, 80) : "",
      testid: element.getAttribute ? element.getAttribute("data-testid") : null,
      name: nameOf(element),
      isBody: element === document.body,
      focusVisible: element !== document.body && typeof element.matches === "function" ? element.matches(":focus-visible") : false,
    };
  };
  v.focus = function () { return describe(document.activeElement); };
  document.addEventListener("click", function (event) {
    var control = event.target instanceof Element ? event.target.closest("button,[role=switch],[role=menuitemradio],input,.list-row") : null;
    v.clicks.push({ seq: v.next(), trusted: event.isTrusted, target: control ? nameOf(control) : (event.target instanceof Element ? event.target.tagName.toLowerCase() : null) });
  }, true);
  document.addEventListener("keydown", function (event) {
    v.keys.push({ seq: v.next(), trusted: event.isTrusted, key: event.key, target: describe(event.target instanceof Element ? event.target : null) });
  }, true);
  document.addEventListener("focusin", function (event) {
    v.focusins.push({ seq: v.next(), target: describe(event.target instanceof Element ? event.target : null) });
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
      clicks: after(v.clicks, mark),
      keys: after(v.keys, mark),
      focusins: after(v.focusins, mark),
      nested: v.nested,
    };
  };
  v.selfTest = async function selfTest() {
    var key = "xai_native_selftest";
    var out = {};
    var mark = v.mark();
    var nestedBefore = v.nested;
    v.denySet(key);
    try { localStorage.setItem(key, "1"); out.setDeniedThrew = false; } catch (error) { out.setDeniedThrew = error instanceof DOMException && error.name === "QuotaExceededError"; }
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
    out.getLogged = (function () { var markGet = v.mark(); localStorage.getItem(key); return after(v.attempts, markGet).filter(function (entry) { return entry.op === "get" && entry.key === key; }).length === 1; })();
    var attempts = v.window(mark).attempts.filter(function (entry) { return entry.key === key; });
    out.attemptsLogged = attempts.map(function (entry) { return entry.op + ":" + entry.outcome; });
    out.noNestedStorageCalls = v.nested === nestedBefore;
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
    out.domGateAddedAndRemoved = dom.dom.some(function (entry) { return entry.kind === "added" && entry.what.indexOf("gate") !== -1; })
      && dom.dom.some(function (entry) { return entry.kind === "removed" && entry.what.indexOf("gate") !== -1; });
    out.htmlAttributeLogged = dom.html.some(function (entry) { return entry.attribute === "data-native-selftest" && entry.now === "1"; });
    v.startFrames();
    await new Promise(function (resolve) { setTimeout(resolve, 250); });
    out.framesSampled = v.stopFrames().length;
    return out;
  };
  window.__native = v;
})();
