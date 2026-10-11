/*
 * CP-CLOCK-01 batch 70 E4: read-only Clock focus probes for the frozen bacdbbc pixelFocusWalk.
 * Adapted from the tracked, accepted Appearance keyboard probe infrastructure. The active
 * descriptors name Clock trigger, style selection and timezone activity; the complete
 * document Tab order remains visible. The frozen decoder self-test samples fixed Topbar
 * pixels to avoid Clock tick or scroll-offset races. No product input, storage or event
 * handler is patched. This fixture is evaluated only after the production App mounts.
 */
(function installVisualKeyboardProbes() {
  "use strict";
  const PANE = '.widget-shell[data-widget-id="clock"] .w-clock-body';
  const EPS = 0.01;
  const round = (value) => Math.round(value * 100) / 100;
  const box = (rect) => (rect ? { left: round(rect.left), top: round(rect.top), right: round(rect.right), bottom: round(rect.bottom), width: round(rect.width), height: round(rect.height) } : null);
  const squash = (text) => String(text == null ? "" : text).replace(/\s+/g, " ").trim();
  const px = (value) => Number.parseFloat(value == null ? "0" : value) || 0;
  const tagClass = (element) => element.tagName.toLowerCase() + Array.from(element.classList).map((name) => `.${name}`).join("");
  const paneRoot = () => document.querySelector(PANE);
  const SEGMENT_IDS = { lang: ["en", "zh"], density: ["comfortable", "compact"] };
  /** The seven SettingRows in display order (identical in the fixed product and in 5cd63ff, which lacks data-appearance-control). */
  const ROW_FIELDS = ["lang", "theme", "density", "accentHue", "bgTone", "railPos", "fontScale"];
  const classSuffix = (element, prefix) => {
    const match = Array.from(element.classList).find((name) => name.indexOf(prefix) === 0);
    return match ? match.slice(prefix.length) : "?";
  };

  // ------------------------------------------------------------------------------------------------
  // Descriptors
  // ------------------------------------------------------------------------------------------------
  const INTERACTIVE = 'button, input, select, textarea, a[href], [tabindex], [role="button"], [role="menuitemradio"], [role="switch"]';
  function describeBase(element) {
    if (!element) return "none";
    if (element === document.body) return "body";
    if (element === document.documentElement) return "html";
    if (!(element instanceof Element)) return "none";
    const pet = element.closest(".pet-wrap, .pet-bubble");
    if (pet || element.closest(".pet-swap-btn")) {
      if (element.closest(".pet-change-link")) return "pet:change-link";
      if (element.closest(".pet-bubble")) return "pet:bubble";
      if (element.closest(".pet-swap-btn")) return "pet:swap";
      return "pet:wrap";
    }
    const clock = element.closest('.widget-shell[data-widget-id="clock"] .w-clock-body');
    if (clock) {
      if (element.closest('.clk-tz-btn')) return 'clock:trigger';
      const style = element.closest('[data-clock-style]');
      if (style) return `clock:style:${style.getAttribute('data-clock-style')}:${style.getAttribute('aria-selected') === 'true' ? 'selected' : 'unselected'}`;
      const tz = element.closest('[data-tz-id]');
      if (tz) return `clock:tz:${tz.getAttribute('data-tz-id')}:${tz.classList.contains('active') ? 'active' : 'inactive'}`;
      if (element.matches('button')) return `clock:action:${squash(element.getAttribute('aria-label') || element.textContent)}`;
      return `clock:part:${tagClass(element)}`;
    }
    const pane = element.closest(".appearance-pane");
    if (pane) {
      const marked = element.closest("[data-appearance-control]");
      const row = element.closest(".setting-row");
      const field = marked ? marked.getAttribute("data-appearance-control") : row ? ROW_FIELDS[Array.from(pane.querySelectorAll(".setting-row")).indexOf(row)] || null : null;
      const control = field ? marked || row : null;
      const recovery = element.closest("[data-appearance-recovery]");
      const testid = element.getAttribute("data-testid");
      if (testid === "appearance-retry-all") return "retry-all";
      if (testid === "appearance-export-draft") return "export";
      if (testid === "appearance-discard-all") return "discard-all";
      if (testid === "appearance-reset-defaults") return "reset";
      if (testid === "appearance-status-line") return "status-line";
      if (testid === "settings-footer-reset") return "footer:reset";
      if (testid === "settings-footer-save") return "footer:save";
      if (recovery && element.tagName === "BUTTON") {
        const id = recovery.getAttribute("data-appearance-recovery");
        const buttons = Array.from(recovery.querySelectorAll("button"));
        if (buttons.length === 1) return `reload:${id}`;
        return `${buttons.indexOf(element) === 0 ? "retry" : "discard"}:${id}`;
      }
      if (control && (element.tagName === "INPUT" || element.tagName === "BUTTON")) {
        if (element.tagName === "INPUT") return field === "fontScale" ? "font-slider" : field === "accentHue" ? "hue-slider" : `input:${field}`;
        if (element.tagName === "BUTTON") {
          if (field === "lang" || field === "density") {
            const index = Array.from(control.querySelectorAll("button")).indexOf(element);
            return `${field}:${SEGMENT_IDS[field][index] ?? index}`;
          }
          if (field === "theme") return `theme:${classSuffix(element.querySelector(".theme-preview") ?? element, "tp-")}`;
          if (field === "accentHue") return `swatch:${Array.from(control.querySelectorAll(".accent-sw")).indexOf(element)}`;
          if (field === "bgTone") return `tone:${classSuffix(element, "bgt-")}`;
          if (field === "railPos") return `railpos:${classSuffix(element, "rp-")}`;
        }
        return `pane-control-part:${field}:${tagClass(element)}`;
      }
      return `pane-other:${tagClass(element)}`;
    }
    const topbar = element.closest("header.topbar");
    if (topbar) {
      if (element.closest('[data-testid="appearance-status"]')) return "topbar:status";
      if (element.closest(".search-box")) return "topbar:search";
      if (element.closest(".topbar-pref-trigger")) return "topbar:trigger";
      const option = element.closest('[role="menuitemradio"]');
      if (option) {
        const section = option.closest("section");
        return `topbar:option:${section ? section.getAttribute("aria-label") : "?"}:${option.getAttribute("aria-label")}`;
      }
      const control = element.closest("button, a[href], input");
      if (control) return `topbar:${tagClass(control)}:${squash(control.getAttribute("aria-label") || control.textContent).slice(0, 30)}`;
      return `topbar-part:${tagClass(element)}`;
    }
    if (element.closest(".app-rail")) {
      if (element.closest(".rail-avatar")) return "rail:avatar";
      const button = element.closest(".rail-btn");
      if (button) return `rail:${button.getAttribute("aria-label")}`;
      return `rail-part:${tagClass(element)}`;
    }
    const row = element.closest(".settings-sidebar .list-row");
    if (row) return `sidebar:${squash(row.textContent)}`;
    return `other:${tagClass(element)}`;
  }
  function describe(element) {
    const base = describeBase(element);
    if (!(element instanceof Element) || element === document.body || element === document.documentElement) return base;
    const selector = 'a[href], area[href], button, input:not([type="hidden"]), select, textarea, iframe, summary, [tabindex], [contenteditable=""], [contenteditable="true"]';
    const same = Array.from(document.querySelectorAll(selector)).filter((item) => describeBase(item) === base);
    return same.length > 1 ? `${base}#${same.indexOf(element)}` : base;
  }
  const targetOf = (element) => {
    if (!(element instanceof Element)) return element;
    return element.closest(`${INTERACTIVE}, .pet-wrap, .pet-bubble`) || element;
  };
  const candidates = () => Array.from(document.querySelectorAll(`${INTERACTIVE}, [data-testid="appearance-status-line"]`));
  function find(desc) {
    if (desc === 'hue-slider') return document.querySelector('header.topbar');
    const all = candidates().filter((element) => describe(element) === desc);
    return all.length === 1 ? all[0] : all.length > 1 ? { ambiguous: all.length } : null;
  }
  const isElement = (value) => value instanceof Element;
  const paneControls = () => {
    const pane = paneRoot();
    return pane ? Array.from(pane.querySelectorAll("button, input")).map(describe) : [];
  };
  const visibleRendered = (element) => element.getClientRects().length > 0 && getComputedStyle(element).visibility !== "hidden";
  const topbarControls = () => {
    const topbar = document.querySelector("header.topbar");
    return topbar ? Array.from(topbar.querySelectorAll("button, a[href], input")).filter(visibleRendered).map(describe) : [];
  };
  /** Every element that sequential focus navigation can reach, in DOM (tree) order (no positive tabindex exists). */
  function tabbables() {
    const selector = 'a[href], area[href], button, input:not([type="hidden"]), select, textarea, iframe, summary, [tabindex], [contenteditable=""], [contenteditable="true"]';
    return Array.from(document.querySelectorAll(selector))
      .filter((element) => element.tabIndex >= 0 && !element.disabled && !element.closest("[inert]") && visibleRendered(element))
      .map(describe);
  }

  // ------------------------------------------------------------------------------------------------
  // Geometry, hit-tests and containment
  // ------------------------------------------------------------------------------------------------
  const POINTS = [[0.5, 0.5], [0.2, 0.2], [0.8, 0.2], [0.2, 0.8], [0.8, 0.8]];
  const POINT_NAMES = ["centre", "topLeft", "topRight", "bottomLeft", "bottomRight"];
  function contentBox(element) {
    const rect = element.getBoundingClientRect();
    const style = getComputedStyle(element);
    return { left: round(rect.left + px(style.borderLeftWidth) + px(style.paddingLeft)), right: round(rect.right - px(style.borderRightWidth) - px(style.paddingRight)) };
  }
  function hitsOf(element) {
    const rect = element.getBoundingClientRect();
    return POINTS.map(([fx, fy], index) => {
      const x = rect.left + rect.width * fx;
      const y = rect.top + rect.height * fy;
      const hit = document.elementFromPoint(x, y);
      return { point: POINT_NAMES[index], x: round(x), y: round(y), ok: Boolean(hit && (hit === element || element.contains(hit))), hit: describe(targetOf(hit)) };
    });
  }
  function probe(desc, scroll) {
    const element = find(desc);
    if (!isElement(element)) return { desc, found: false, ambiguous: element && element.ambiguous ? element.ambiguous : 0 };
    if (scroll !== false) element.scrollIntoView({ block: "center", inline: "nearest", behavior: "instant" });
    const rect = element.getBoundingClientRect();
    const detailElement = document.querySelector(".settings-detail");
    const detail = detailElement ? detailElement.getBoundingClientRect() : null;
    const detailContent = detailElement ? contentBox(detailElement) : null;
    const topbarElement = element.closest("header.topbar");
    const topbar = topbarElement ? topbarElement.getBoundingClientRect() : null;
    const hits = hitsOf(element);
    const style = getComputedStyle(element);
    const result = {
      desc, found: true, rect: box(rect),
      centerHit: hits[0].ok, allHit: hits.every((hit) => hit.ok), centerTarget: hits[0].hit,
      inViewport: rect.left >= -EPS && rect.top >= -EPS && rect.right <= innerWidth + EPS && rect.bottom <= innerHeight + EPS,
      inDetail: detail && !topbarElement ? rect.left >= detail.left - EPS && rect.right <= detail.right + EPS : null,
      inDetailContent: detailContent && !topbarElement ? rect.left >= detailContent.left - EPS && rect.right <= detailContent.right + EPS : null,
      detailGap: detail && !topbarElement ? { left: round(rect.left - detail.left), right: round(detail.right - rect.right) } : null,
      inTopbar: topbar ? rect.left >= topbar.left - EPS && rect.right <= topbar.right + EPS && rect.top >= topbar.top - EPS && rect.bottom <= topbar.bottom + EPS : null,
      visible: style.visibility === "visible" && style.display !== "none" && Number(style.opacity) > 0,
      overflow: { sw: element.scrollWidth, cw: element.clientWidth, sh: element.scrollHeight, ch: element.clientHeight },
      tabIndex: element.tabIndex,
      disabledAttr: element.hasAttribute("disabled"),
      ariaDisabled: element.getAttribute("aria-disabled"),
    };
    if (!result.allHit) result.hits = hits;
    return result;
  }
  function chainOf(start) {
    const chain = [];
    for (let node = start; node; node = node.parentElement) {
      const style = getComputedStyle(node);
      chain.push({ name: tagClass(node), overflowX: style.overflowX, overflowY: style.overflowY, scrollWidth: node.scrollWidth, clientWidth: node.clientWidth, scrollHeight: node.scrollHeight, clientHeight: node.clientHeight, scrollLeft: round(node.scrollLeft), scrollTop: round(node.scrollTop) });
    }
    return chain;
  }
  function layout() {
    const root = document.documentElement;
    const detail = document.querySelector(".settings-detail");
    const pane = paneRoot();
    const actions = pane ? pane.querySelector(".appearance-actions") : null;
    const actionsStyle = actions ? getComputedStyle(actions) : null;
    const rows = actions ? Array.from(actions.querySelectorAll(":scope > .appearance-actions-row")) : [];
    return {
      viewport: { width: innerWidth, height: innerHeight, dpr: devicePixelRatio },
      document: { scrollWidth: root.scrollWidth, clientWidth: root.clientWidth, bodyScrollWidth: document.body.scrollWidth, scrollX: round(scrollX), scrollY: round(scrollY) },
      detail: detail ? { rect: box(detail.getBoundingClientRect()), content: contentBox(detail), scrollWidth: detail.scrollWidth, clientWidth: detail.clientWidth, scrollLeft: round(detail.scrollLeft), pane: detail.getAttribute("data-pane") } : null,
      pane: pane ? { rect: box(pane.getBoundingClientRect()), scrollWidth: pane.scrollWidth, clientWidth: pane.clientWidth } : null,
      actions: actions ? {
        rect: box(actions.getBoundingClientRect()), content: contentBox(actions), className: actions.className,
        position: actionsStyle.position, display: actionsStyle.display, flexDirection: actionsStyle.flexDirection, flexWrap: actionsStyle.flexWrap, justifyContent: actionsStyle.justifyContent,
        isLastPaneChild: pane.lastElementChild === actions,
        children: Array.from(actions.children).map((child) => ({ name: tagClass(child), testid: child.getAttribute("data-testid") })),
        rows: rows.map((row) => {
          const style = getComputedStyle(row);
          return { rect: box(row.getBoundingClientRect()), content: contentBox(row), position: style.position, flexWrap: style.flexWrap, justifyContent: style.justifyContent, buttons: Array.from(row.querySelectorAll("button")).map(describe) };
        }),
        footerClassesAnywhereInPane: pane.querySelectorAll(".pane-footer, .pane-save").length,
      } : null,
      chain: chainOf(pane),
    };
  }
  /** Retry all's box model and content size, for "sized to its content (never stretched)" and "same box". */
  function retryAllBox() {
    const element = find("retry-all");
    if (!isElement(element)) return null;
    const style = getComputedStyle(element);
    const range = document.createRange();
    range.selectNodeContents(element);
    const text = range.getBoundingClientRect();
    const rect = element.getBoundingClientRect();
    const row = element.closest(".appearance-actions-row");
    const intrinsic = text.width + px(style.paddingLeft) + px(style.paddingRight) + px(style.borderLeftWidth) + px(style.borderRightWidth);
    return {
      rect: box(rect), textWidth: round(text.width), intrinsicWidth: round(intrinsic), rowContent: row ? contentBox(row) : null,
      css: { width: style.width, height: style.height, minWidth: style.minWidth, minHeight: style.minHeight, paddingLeft: style.paddingLeft, paddingRight: style.paddingRight, paddingTop: style.paddingTop, paddingBottom: style.paddingBottom,
        borderTopWidth: style.borderTopWidth, borderRightWidth: style.borderRightWidth, borderBottomWidth: style.borderBottomWidth, borderLeftWidth: style.borderLeftWidth, borderStyle: style.borderTopStyle, flex: style.flex, alignSelf: style.alignSelf, fontSize: style.fontSize, fontWeight: style.fontWeight },
      firstInRow: row ? row.firstElementChild === element : false,
      startAligned: row ? Math.abs(rect.left - contentBox(row).left) <= 0.5 : false,
      childElements: element.children.length,
      classList: Array.from(element.classList),
      animations: element.getAnimations().length,
    };
  }

  // ------------------------------------------------------------------------------------------------
  // DesktopPet and the A2.8 gate
  // ------------------------------------------------------------------------------------------------
  function petState() {
    const wrap = document.querySelector(".pet-wrap");
    const swap = document.querySelector(".pet-swap-btn");
    const bubble = document.querySelector(".pet-bubble");
    const wrapBox = wrap ? box(wrap.getBoundingClientRect()) : null;
    const swapBox = swap ? box(swap.getBoundingClientRect()) : null;
    const union = wrapBox ? (swapBox ? { left: Math.min(wrapBox.left, swapBox.left), top: Math.min(wrapBox.top, swapBox.top), right: Math.max(wrapBox.right, swapBox.right), bottom: Math.max(wrapBox.bottom, swapBox.bottom) } : { left: wrapBox.left, top: wrapBox.top, right: wrapBox.right, bottom: wrapBox.bottom }) : null;
    return {
      present: Boolean(wrap), wrap: wrapBox, swap: swapBox, union,
      transform: wrap ? wrap.style.transform || null : null,
      bubble: bubble ? { rect: box(bubble.getBoundingClientRect()), pointerEvents: getComputedStyle(bubble).pointerEvents } : null,
      hovered: Boolean(wrap && wrap.matches(":hover")),
      focusWithin: Boolean(wrap && wrap.matches(":focus-within")),
    };
  }
  /** The A2.8 gate for one control: geometric separation from the pet union, five points, intersection. */
  function gate(desc) {
    const element = find(desc);
    if (!isElement(element)) return { desc, found: false };
    const rect = element.getBoundingClientRect();
    const pet = petState();
    const union = pet.union;
    const hits = hitsOf(element).map((hit) => ({ ...hit, on: hit.ok ? "button" : hit.hit }));
    const ix = union ? Math.max(0, Math.min(rect.right, union.right) - Math.max(rect.left, union.left)) : 0;
    const iy = union ? Math.max(0, Math.min(rect.bottom, union.bottom) - Math.max(rect.top, union.top)) : 0;
    const detail = document.querySelector(".settings-detail");
    const detailRect = detail ? detail.getBoundingClientRect() : null;
    return {
      desc, found: true, rect: box(rect), pet, separationPx: union ? round(union.left - rect.right) : null,
      intersection: { width: round(ix), height: round(iy), area: round(ix * iy) },
      hits, allOnButton: hits.every((hit) => hit.ok),
      inViewport: rect.left >= -EPS && rect.top >= -EPS && rect.right <= innerWidth + EPS && rect.bottom <= innerHeight + EPS,
      inDetail: detailRect ? rect.left >= detailRect.left - EPS && rect.right <= detailRect.right + EPS : null,
      ariaDisabled: element.getAttribute("aria-disabled"),
      scroller: scrollState().settings,
    };
  }
  function scrollState() {
    const scroller = document.querySelector(".module-settings");
    return {
      window: { x: round(scrollX), y: round(scrollY) },
      settings: scroller ? { scrollTop: round(scroller.scrollTop), scrollLeft: round(scroller.scrollLeft), scrollHeight: scroller.scrollHeight, clientHeight: scroller.clientHeight, maxScrollTop: scroller.scrollHeight - scroller.clientHeight, overflowY: getComputedStyle(scroller).overflowY } : null,
      chain: chainOf(paneRoot()).map((entry) => ({ name: entry.name, top: entry.scrollTop, left: entry.scrollLeft })),
    };
  }
  /** Every element (and the window) whose scroll offset is not zero: which containers a probe or focus scrolled. */
  function scrolled() {
    const out = [];
    if (scrollX !== 0 || scrollY !== 0) out.push({ name: "window", top: round(scrollY), left: round(scrollX) });
    document.querySelectorAll("*").forEach((element) => {
      if (element.scrollTop !== 0 || element.scrollLeft !== 0) {
        const style = getComputedStyle(element);
        out.push({ name: tagClass(element), top: round(element.scrollTop), left: round(element.scrollLeft), overflowX: style.overflowX, overflowY: style.overflowY, scrollHeight: element.scrollHeight, clientHeight: element.clientHeight });
      }
    });
    return out;
  }
  /** The window (document) scroll: at 1024x768 the App is taller than the viewport, so the page itself scrolls vertically. */
  function scrollWindowTo(top) {
    window.scrollTo({ top: top === "end" ? document.documentElement.scrollHeight : Number(top), left: 0, behavior: "instant" });
    return { y: round(scrollY), max: document.documentElement.scrollHeight - document.documentElement.clientHeight };
  }
  function scrollSettingsTo(where) {
    const scroller = document.querySelector(".module-settings");
    if (!scroller) return null;
    scroller.scrollTo({ top: where === "end" ? scroller.scrollHeight : where === "top" ? 0 : Number(where), behavior: "instant" });
    return scrollState().settings;
  }

  // ------------------------------------------------------------------------------------------------
  // Topbar
  // ------------------------------------------------------------------------------------------------
  function topbar() {
    const header = document.querySelector("header.topbar");
    if (!header) return null;
    const trigger = header.querySelector(".topbar-pref-trigger");
    const summary = trigger ? trigger.querySelector(".topbar-pref-summary") : null;
    const status = header.querySelector('[data-testid="appearance-status"]');
    const statusText = status ? status.querySelector(".appearance-status-text") : null;
    const shown = (element) => Boolean(element) && getComputedStyle(element).display !== "none" && element.getBoundingClientRect().width > 0;
    const controls = topbarControls().map((desc) => probe(desc, false));
    return {
      rect: box(header.getBoundingClientRect()), scrollWidth: header.scrollWidth, clientWidth: header.clientWidth,
      controlsBox: header.querySelector(".topbar-controls") ? { rect: box(header.querySelector(".topbar-controls").getBoundingClientRect()), scrollWidth: header.querySelector(".topbar-controls").scrollWidth, clientWidth: header.querySelector(".topbar-controls").clientWidth } : null,
      summaryVisible: shown(summary), summaryRect: summary ? box(summary.getBoundingClientRect()) : null, summaryText: summary ? squash(summary.textContent) : null,
      status: status ? { rect: box(status.getBoundingClientRect()), name: status.getAttribute("aria-label"), text: statusText ? squash(statusText.textContent) : null, textVisible: shown(statusText), textRect: statusText ? box(statusText.getBoundingClientRect()) : null, icon: Boolean(status.querySelector("svg")),
        beforeTrigger: Boolean(trigger) && Boolean(status.compareDocumentPosition(trigger) & Node.DOCUMENT_POSITION_FOLLOWING) } : null,
      controls,
      order: Array.from(header.querySelectorAll(".topbar-controls > *")).map((element) => element.getAttribute("data-testid") || (typeof element.className === "string" ? element.className.trim().split(/\s+/)[0] : element.tagName.toLowerCase())),
    };
  }

  // ------------------------------------------------------------------------------------------------
  // Overlap, text clipping, existing-control geometry
  // ------------------------------------------------------------------------------------------------
  function overlapReport() {
    const area = (a, b) => Math.max(0, Math.min(a.right, b.right) - Math.max(a.left, b.left)) * Math.max(0, Math.min(a.bottom, b.bottom) - Math.max(a.top, b.top));
    const groups = [];
    const pane = paneRoot();
    if (pane) {
      groups.push({ name: "pane-children", parts: Array.from(pane.children) });
      pane.querySelectorAll("[data-appearance-recovery]").forEach((block) => groups.push({ name: `recovery:${block.getAttribute("data-appearance-recovery")}`, parts: Array.from(block.children) }));
      const actions = pane.querySelector(".appearance-actions");
      if (actions) {
        groups.push({ name: "actions", parts: Array.from(actions.children) });
        actions.querySelectorAll(".appearance-actions-row").forEach((row, index) => groups.push({ name: `actions-row:${index}`, parts: Array.from(row.children) }));
      }
      pane.querySelectorAll(".setting-row").forEach((row, index) => {
        const parts = Array.from(row.querySelectorAll("button, input"));
        if (parts.length) groups.push({ name: `row-controls:${index}`, parts });
      });
    }
    const header = document.querySelector("header.topbar");
    if (header) groups.push({ name: "topbar-controls", parts: Array.from(header.querySelectorAll(".search-box, [data-testid='appearance-status'], .topbar-pref-trigger")) });
    return groups.map((group) => {
      const overlaps = [];
      const rects = group.parts.map((part) => part.getBoundingClientRect());
      for (let i = 0; i < rects.length; i += 1) {
        for (let j = i + 1; j < rects.length; j += 1) {
          const shared = area(rects[i], rects[j]);
          if (shared > 0.5) overlaps.push({ a: describe(targetOf(group.parts[i])), b: describe(targetOf(group.parts[j])), area: round(shared) });
        }
      }
      return { name: group.name, parts: group.parts.length, overlaps };
    });
  }
  function textClip() {
    const pane = paneRoot();
    const header = document.querySelector("header.topbar");
    const elements = [];
    if (pane) elements.push(...pane.querySelectorAll(".pane-title, .sr-label, .appearance-recovery-text, .appearance-status-line, .appearance-recovery-field > button, .appearance-actions button"));
    if (header) elements.push(...header.querySelectorAll('[data-testid="appearance-status"]'));
    return elements.map((element) => ({ desc: describe(element), text: squash(element.textContent).slice(0, 60), sw: element.scrollWidth, cw: element.clientWidth, sh: element.scrollHeight, ch: element.clientHeight }));
  }
  /** Boxes of the existing (unchanged) row controls, keyed by descriptor; the bottom area is excluded. */
  function rowControlGeometry() {
    const pane = paneRoot();
    if (!pane) return null;
    const out = {};
    pane.querySelectorAll(".setting-row button, .setting-row input").forEach((element) => {
      const rect = element.getBoundingClientRect();
      out[describe(element)] = { width: round(rect.width), height: round(rect.height) };
    });
    return out;
  }

  /** Computed styles of every element of the seven SettingRows (structural paths), for the 5cd63ff comparison. */
  const STYLE_PROPS = ["display", "position", "box-sizing", "width", "height", "min-width", "min-height", "max-width", "margin-top", "margin-right", "margin-bottom", "margin-left",
    "padding-top", "padding-right", "padding-bottom", "padding-left", "border-top-width", "border-right-width", "border-bottom-width", "border-left-width", "border-top-style",
    "border-top-color", "border-right-color", "border-bottom-color", "border-left-color", "border-top-left-radius", "border-bottom-right-radius", "color", "background-color",
    "background-image", "font-family", "font-size", "font-weight", "font-style", "line-height", "letter-spacing", "text-align", "text-transform", "white-space", "opacity",
    "box-shadow", "outline-style", "outline-width", "outline-color", "transform", "row-gap", "column-gap", "grid-template-columns", "flex-direction", "flex-wrap", "flex-grow",
    "flex-shrink", "flex-basis", "align-items", "justify-content", "overflow-x", "overflow-y", "visibility", "cursor", "z-index", "fill", "stroke", "appearance", "accent-color",
    "vertical-align", "text-overflow"];
  function styleFingerprint() {
    const pane = paneRoot();
    if (!pane) return null;
    const out = {};
    const walk = (element, path) => {
      const style = getComputedStyle(element);
      out[path] = Object.fromEntries(STYLE_PROPS.map((property) => [property, style.getPropertyValue(property)]));
      const counts = {};
      Array.from(element.children).forEach((child) => {
        const key = tagClass(child);
        counts[key] = (counts[key] || 0) + 1;
        walk(child, `${path}>${key}:${counts[key]}`);
      });
    };
    Array.from(pane.querySelectorAll(".setting-row")).forEach((row, index) => walk(row, `row${index}`));
    return out;
  }

  // ------------------------------------------------------------------------------------------------
  // Full-pane capture fidelity (Features v2 pattern, adapted to .appearance-pane)
  // ------------------------------------------------------------------------------------------------
  function captureGeometry() {
    const pane = paneRoot();
    const detail = document.querySelector(".settings-detail");
    if (!pane || !detail) return null;
    const top = pane.getBoundingClientRect().top;
    const rel = (element) => {
      const rect = element.getBoundingClientRect();
      return [describe(targetOf(element)), round(rect.left), round(rect.right), round(rect.top - top), round(rect.height)];
    };
    const detailRect = detail.getBoundingClientRect();
    return {
      detail: [round(detailRect.left), round(detailRect.right)],
      tones: getComputedStyle(pane.querySelector(".bg-tones") || pane).gridTemplateColumns || null,
      parts: [pane, ...pane.querySelectorAll(".setting-row, [data-appearance-recovery], .appearance-actions, .appearance-actions-row, .appearance-status-line, button, input")].map(rel),
    };
  }
  function classicScroller() {
    const pane = paneRoot();
    for (let node = pane ? pane.parentElement : null; node; node = node.parentElement) {
      const style = getComputedStyle(node);
      if (!/(auto|scroll)/.test(style.overflowY)) continue;
      const scrollbar = node.offsetWidth - node.clientWidth - px(style.borderLeftWidth) - px(style.borderRightWidth);
      if (scrollbar > 0) return { element: node, scrollbar };
    }
    return null;
  }
  function pinScrollbarGutter() {
    const scroller = classicScroller();
    if (!scroller) return { pinned: false, scrollbar: 0 };
    scroller.element.setAttribute("data-visual-capture-scroller", "1");
    const tag = document.createElement("style");
    tag.setAttribute("data-visual-capture", "1");
    tag.textContent = "[data-visual-capture-scroller] { scrollbar-gutter: stable; }";
    document.head.appendChild(tag);
    return { pinned: true, scrollbar: scroller.scrollbar, scroller: tagClass(scroller.element) };
  }
  function unpinScrollbarGutter() {
    document.querySelectorAll("style[data-visual-capture]").forEach((tag) => tag.remove());
    document.querySelectorAll("[data-visual-capture-scroller]").forEach((element) => element.removeAttribute("data-visual-capture-scroller"));
    return document.querySelectorAll("style[data-visual-capture], [data-visual-capture-scroller]").length === 0;
  }
  function verticalOverflow() {
    let most = Math.max(0, document.documentElement.scrollHeight - document.documentElement.clientHeight);
    for (const entry of chainOf(paneRoot())) {
      if (/(auto|scroll)/.test(entry.overflowY)) most = Math.max(most, entry.scrollHeight - entry.clientHeight);
    }
    return most;
  }

  // ------------------------------------------------------------------------------------------------
  // Colours: computed values, sRGB conversion (own math + canvas cross-check), composition, WCAG contrast
  // ------------------------------------------------------------------------------------------------
  const canvas = document.createElement("canvas");
  canvas.width = 1;
  canvas.height = 1;
  const context = canvas.getContext("2d", { willReadFrequently: true });
  /** The browser's own conversion of a CSS colour to 8-bit sRGB (an independent cross-check). */
  function canvasRgba(css) {
    context.clearRect(0, 0, 1, 1);
    context.fillStyle = "rgb(1, 2, 3)";
    context.fillStyle = css;
    const parsed = context.fillStyle !== "#010203" || /^rgb\(\s*1,\s*2,\s*3\s*\)$/.test(css) || css === "#010203";
    context.fillRect(0, 0, 1, 1);
    const data = context.getImageData(0, 0, 1, 1).data;
    return { parsed, rgba: [data[0], data[1], data[2], round(data[3] / 255)] };
  }
  const toLinear = (channel) => (channel <= 0.04045 ? channel / 12.92 : Math.pow((channel + 0.055) / 1.055, 2.4));
  const toGamma = (channel) => (channel <= 0.0031308 ? 12.92 * channel : 1.055 * Math.pow(channel, 1 / 2.4) - 0.055);
  const clip = (value) => Math.min(1, Math.max(0, value));
  function oklabToSrgb(L, a, b) {
    const l_ = L + 0.3963377774 * a + 0.2158037573 * b;
    const m_ = L - 0.1055613458 * a - 0.0638541728 * b;
    const s_ = L - 0.0894841775 * a - 1.291485548 * b;
    const l = l_ * l_ * l_;
    const m = m_ * m_ * m_;
    const s = s_ * s_ * s_;
    const r = 4.0767416621 * l - 3.3077115913 * m + 0.2309699292 * s;
    const g = -1.2684380046 * l + 2.6097574011 * m - 0.3413193965 * s;
    const bl = -0.0041960863 * l - 0.7034186147 * m + 1.707614701 * s;
    return [clip(toGamma(r)), clip(toGamma(g)), clip(toGamma(bl))];
  }
  const number = (token, percentScale) => {
    if (token === "none") return 0;
    if (/%$/.test(token)) return (Number.parseFloat(token) / 100) * percentScale;
    return Number.parseFloat(token);
  };
  /** Parses the computed-value serialisations Chrome produces: rgb()/rgba(), oklch(), oklab(), color(srgb ...). */
  function parseColor(css) {
    const text = String(css).trim();
    let match = /^rgba?\(([^)]*)\)$/.exec(text);
    if (match) {
      const parts = match[1].split(/[\s,/]+/).filter(Boolean);
      return { rgb: [number(parts[0], 255) / 255, number(parts[1], 255) / 255, number(parts[2], 255) / 255], alpha: parts[3] === undefined ? 1 : number(parts[3], 1), format: "rgb" };
    }
    match = /^oklch\(([^)]*)\)$/.exec(text);
    if (match) {
      const [main, alphaText] = match[1].split("/");
      const parts = main.trim().split(/\s+/);
      const L = number(parts[0], 1);
      const C = number(parts[1], 0.4);
      const h = (number(parts[2], 1) * Math.PI) / 180;
      return { rgb: oklabToSrgb(L, C * Math.cos(h), C * Math.sin(h)), alpha: alphaText === undefined ? 1 : number(alphaText.trim(), 1), format: "oklch" };
    }
    match = /^oklab\(([^)]*)\)$/.exec(text);
    if (match) {
      const [main, alphaText] = match[1].split("/");
      const parts = main.trim().split(/\s+/);
      return { rgb: oklabToSrgb(number(parts[0], 1), number(parts[1], 0.4), number(parts[2], 0.4)), alpha: alphaText === undefined ? 1 : number(alphaText.trim(), 1), format: "oklab" };
    }
    match = /^color\(srgb\s+([^)]*)\)$/.exec(text);
    if (match) {
      const [main, alphaText] = match[1].split("/");
      const parts = main.trim().split(/\s+/);
      return { rgb: [number(parts[0], 1), number(parts[1], 1), number(parts[2], 1)].map(clip), alpha: alphaText === undefined ? 1 : number(alphaText.trim(), 1), format: "srgb" };
    }
    return null;
  }
  const over = (top, alpha, bottom) => top.map((channel, index) => alpha * channel + (1 - alpha) * bottom[index]);
  const luminance = (rgb) => 0.2126 * toLinear(rgb[0]) + 0.7152 * toLinear(rgb[1]) + 0.0722 * toLinear(rgb[2]);
  const contrastOf = (a, b) => {
    const la = luminance(a);
    const lb = luminance(b);
    return (Math.max(la, lb) + 0.05) / (Math.min(la, lb) + 0.05);
  };
  const to255 = (rgb) => rgb.map((channel) => Math.round(channel * 255));
  function colourRecord(css) {
    const own = parseColor(css);
    const browser = canvasRgba(css);
    const agree = Boolean(own) && browser.parsed && to255(own.rgb).every((value, index) => Math.abs(value - browser.rgba[index]) <= 1) && Math.abs(own.alpha - browser.rgba[3]) <= 0.01;
    return { css, own: own ? { rgb255: to255(own.rgb), alpha: round(own.alpha), format: own.format } : null, canvas: browser.rgba, canvasParsed: browser.parsed, agree };
  }
  /** Label-on-background contrast of a control, with alpha composition and the effective opacity (contract §9). */
  function colours(desc) {
    const element = find(desc);
    if (!isElement(element)) return { desc, found: false };
    const style = getComputedStyle(element);
    const chain = [];
    for (let node = element; node; node = node.parentElement) {
      const s = getComputedStyle(node);
      chain.push({ name: tagClass(node), background: s.backgroundColor, backgroundImage: s.backgroundImage, opacity: Number(s.opacity) });
    }
    // Backdrop behind the element: the nearest opaque ancestor background, with every translucent layer between it
    // and the element composited over it. A background image on any layer used makes the measurement undecidable.
    let index = 1;
    while (index < chain.length && (parseColor(chain[index].background) || { alpha: 0 }).alpha < 1) index += 1;
    const used = chain.slice(1, Math.min(index + 1, chain.length));
    let backdrop = index < chain.length ? parseColor(chain[index].background).rgb : [1, 1, 1];
    for (let layer = Math.min(index, chain.length) - 1; layer >= 1; layer -= 1) {
      const parsed = parseColor(chain[layer].background);
      if (parsed && parsed.alpha > 0) backdrop = over(parsed.rgb, parsed.alpha, backdrop);
    }
    const imagesInUsedLayers = [chain[0], ...used].filter((entry) => entry.backgroundImage && entry.backgroundImage !== "none").map((entry) => entry.name);
    const ownBackground = parseColor(style.backgroundColor);
    const label = parseColor(style.color);
    if (!ownBackground || !label) return { desc, found: true, unparsed: { background: style.backgroundColor, color: style.color } };
    const effectiveBackground = over(ownBackground.rgb, ownBackground.alpha, backdrop);
    const labelOnBackground = over(label.rgb, label.alpha, effectiveBackground);
    const opacity = chain.reduce((product, entry) => product * entry.opacity, 1);
    const finalBackground = over(effectiveBackground, opacity, backdrop);
    const finalLabel = over(labelOnBackground, opacity, backdrop);
    return {
      desc, found: true,
      computed: { color: style.color, backgroundColor: style.backgroundColor, borderColor: [style.borderTopColor, style.borderRightColor, style.borderBottomColor, style.borderLeftColor], opacity: style.opacity, cursor: style.cursor, pointerEvents: style.pointerEvents,
        outlineStyle: style.outlineStyle, outlineWidth: style.outlineWidth, outlineColor: style.outlineColor, boxShadow: style.boxShadow, filter: style.filter, textDecorationLine: style.textDecorationLine, backgroundImage: style.backgroundImage },
      conversions: { color: colourRecord(style.color), backgroundColor: colourRecord(style.backgroundColor), borderColor: colourRecord(style.borderTopColor) },
      effectiveOpacity: round(opacity),
      backdropLayer: index < chain.length ? chain[index].name : "canvas-default-white",
      imagesInUsedLayers,
      label255: to255(finalLabel), background255: to255(finalBackground),
      contrast: Math.round(contrastOf(finalLabel, finalBackground) * 1000) / 1000,
    };
  }
  /** Converter self-test against known values (run on the seed page and in every document that measures colours). */
  function colourSelfTest() {
    const cases = [
      ["rgb(255, 0, 0)", [255, 0, 0]], ["rgb(255, 255, 255)", [255, 255, 255]], ["rgb(0, 0, 0)", [0, 0, 0]], ["rgba(10, 20, 30, 0.5)", [10, 20, 30]],
      ["oklch(1 0 0)", [255, 255, 255]], ["oklch(0 0 0)", [0, 0, 0]], ["oklch(0.627955 0.257683 29.2339)", [255, 0, 0]], ["oklch(0.519975 0.176858 142.495)", [0, 128, 0]],
      ["oklch(0.58 0.008 230)", null], ["oklch(0.984 0.004 235)", null], ["oklch(0.19 0.01 230)", null], ["oklch(0.62 0.006 200)", null],
    ];
    const results = cases.map(([css, expected]) => {
      const record = colourRecord(css);
      return { css, own: record.own && record.own.rgb255, canvas: record.canvas, agree: record.agree, expectedOk: expected === null || (record.own && record.own.rgb255.every((value, index) => Math.abs(value - expected[index]) <= 1)) };
    });
    const whiteBlack = Math.round(contrastOf([1, 1, 1], [0, 0, 0]) * 100) / 100;
    return { results, allAgree: results.every((entry) => entry.agree && entry.expectedOk), whiteOnBlack: whiteBlack };
  }

  // ------------------------------------------------------------------------------------------------
  // Focus, settle, scroll positive control
  // ------------------------------------------------------------------------------------------------
  const FOCUS_VIEW_TOLERANCE = 0.999;
  function focusInfo() {
    const element = document.activeElement;
    if (!element || element === document.body || element === document.documentElement) return { desc: describe(element), isBody: true };
    const style = getComputedStyle(element);
    const rect = element.getBoundingClientRect();
    const hit = document.elementFromPoint(rect.left + rect.width / 2, rect.top + rect.height / 2);
    const overhang = round(Math.max(0, -rect.left, -rect.top, rect.right - innerWidth, rect.bottom - innerHeight));
    return {
      desc: describe(element), isBody: false, focusVisible: element.matches(":focus-visible"),
      outline: { style: style.outlineStyle, width: style.outlineWidth, color: style.outlineColor, offset: style.outlineOffset },
      rect: box(rect), overhang, inViewport: overhang <= FOCUS_VIEW_TOLERANCE,
      centerHit: Boolean(hit && (hit === element || element.contains(hit))), centerTarget: describe(targetOf(hit)),
      inPane: Boolean(element.closest(PANE)), ariaDisabled: element.getAttribute("aria-disabled"), disabledAttr: element.hasAttribute("disabled"),
    };
  }
  async function settle() {
    if (document.fonts && document.fonts.ready) await document.fonts.ready;
    const finite = () => document.getAnimations().filter((animation) => {
      if (animation.playState !== "running") return false;
      const timing = animation.effect && animation.effect.getComputedTiming ? animation.effect.getComputedTiming() : null;
      return !timing || timing.endTime !== Infinity;
    });
    let frames = 0;
    for (; frames < 120; frames += 1) {
      await new Promise((resolve) => requestAnimationFrame(() => requestAnimationFrame(resolve)));
      if (finite().length === 0) break;
    }
    return { frames, running: finite().length, fonts: document.fonts ? document.fonts.status : null };
  }
  let scrollProbe = null;
  function armScrollProbe() {
    scrollProbe = document.querySelector(`${PANE} .pane-title`);
    if (!scrollProbe) return null;
    scrollProbe.setAttribute("tabindex", "-1");
    scrollProbe.setAttribute("data-visual-scroll-probe", "1");
    scrollProbe.focus();
    return document.activeElement === scrollProbe;
  }
  function disarmScrollProbe() {
    if (!scrollProbe) return false;
    scrollProbe.blur();
    scrollProbe.removeAttribute("tabindex");
    scrollProbe.removeAttribute("data-visual-scroll-probe");
    scrollProbe = null;
    return document.querySelectorAll("[data-visual-scroll-probe]").length === 0;
  }
  /** Marks one element as the click target of the runner (removed by the runner right after the click). */
  function tag(desc) {
    document.querySelectorAll("[data-visual-target]").forEach((element) => element.removeAttribute("data-visual-target"));
    const element = find(desc);
    if (!isElement(element)) return element && element.ambiguous ? `ambiguous:${element.ambiguous}` : "missing";
    element.setAttribute("data-visual-target", "1");
    return "tagged";
  }
  function untag() {
    document.querySelectorAll("[data-visual-target]").forEach((element) => element.removeAttribute("data-visual-target"));
    return document.querySelectorAll("[data-visual-target]").length === 0;
  }

  window.__visual = {
    describe: (selector) => describe(document.querySelector(selector)),
    activeDesc: () => describe(document.activeElement),
    find: (desc) => isElement(find(desc)),
    paneControls, topbarControls, tabbables,
    probe: (desc, scroll) => probe(desc, scroll),
    probeAll: (descs, scroll) => descs.map((desc) => probe(desc, scroll)),
    layout, retryAllBox, petState, gate, scrollState, scrollSettingsTo, scrollWindowTo, scrolled, topbar, overlapReport, textClip, rowControlGeometry, styleFingerprint,
    captureGeometry, pinScrollbarGutter, unpinScrollbarGutter, verticalOverflow,
    colours, colourSelfTest, focusInfo, settle, armScrollProbe, disarmScrollProbe, tag, untag,
  };
})();
