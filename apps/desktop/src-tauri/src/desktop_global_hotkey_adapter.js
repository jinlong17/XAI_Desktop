(function () {
  if (typeof globalThis === "undefined") {
    return;
  }

  const invoke = globalThis.__TAURI__?.core?.invoke;
  if (typeof invoke !== "function") {
    return;
  }

  const SNAPSHOT_EVENT_NAME = "xai:desktop-global-hotkey-snapshot";

  globalThis.__XAI_DESKTOP_GLOBAL_HOTKEY__ = {
    getSnapshot() {
      return invoke("desktop_global_hotkey_get_snapshot");
    },
    setPreference(input) {
      return invoke("desktop_global_hotkey_set_preference", { input });
    },
    subscribe(handler) {
      if (typeof handler !== "function") {
        return function unsubscribeNoop() {};
      }

      const listener = (event) => {
        handler(event?.detail);
      };

      globalThis.addEventListener(SNAPSHOT_EVENT_NAME, listener);
      return function unsubscribe() {
        globalThis.removeEventListener(SNAPSHOT_EVENT_NAME, listener);
      };
    },
  };
})();
