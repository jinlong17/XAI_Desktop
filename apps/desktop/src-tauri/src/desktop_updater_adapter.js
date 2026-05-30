(function () {
  if (typeof globalThis === "undefined") {
    return;
  }

  function readInvoke() {
    const invoke =
      globalThis.__TAURI_INTERNALS__?.invoke
      || globalThis.__TAURI__?.core?.invoke;
    if (typeof invoke !== "function") {
      throw new Error("tauri_invoke_unavailable");
    }
    return invoke;
  }

  const SNAPSHOT_EVENT_NAME = "xai:desktop-updater-snapshot";

  globalThis.__XAI_DESKTOP_UPDATER__ = {
    getSnapshot() {
      return readInvoke()("desktop_updater_get_snapshot");
    },
    check() {
      return readInvoke()("desktop_updater_check");
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
