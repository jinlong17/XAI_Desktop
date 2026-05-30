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

  globalThis.__XAI_DESKTOP_NOTIFICATION__ = {
    isPermissionGranted() {
      return readInvoke()("plugin:notification|is_permission_granted");
    },
    requestPermission() {
      return readInvoke()("plugin:notification|request_permission").then((state) => {
        return state === "prompt-with-rationale" ? "prompt" : state;
      });
    },
    sendNotification(input) {
      return readInvoke()("plugin:notification|notify", {
        options: input,
      });
    },
  };
})();
