(function () {
  if (typeof globalThis === "undefined") {
    return;
  }

  const invoke = globalThis.__TAURI__?.core?.invoke;
  if (typeof invoke !== "function") {
    return;
  }

  const ACTION_EVENT_NAME = "xai:desktop-statusbar-quick-action";

  globalThis.__XAI_DESKTOP_STATUSBAR__ = {
    publishSnapshot(snapshot) {
      return invoke("statusbar_set_snapshot", { payload: snapshot });
    },
    subscribe(handler) {
      if (typeof handler !== "function") {
        return function unsubscribeNoop() {};
      }

      const listener = (event) => {
        handler(event?.detail);
      };

      globalThis.addEventListener(ACTION_EVENT_NAME, listener);
      return function unsubscribe() {
        globalThis.removeEventListener(ACTION_EVENT_NAME, listener);
      };
    },
  };
})();
