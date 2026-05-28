(function () {
  if (typeof globalThis === "undefined") {
    return;
  }

  const tauriNotification = globalThis.__TAURI__?.notification;
  if (!tauriNotification) {
    return;
  }

  globalThis.__XAI_DESKTOP_NOTIFICATION__ = {
    isPermissionGranted: () => tauriNotification.isPermissionGranted(),
    requestPermission: () => tauriNotification.requestPermission(),
    sendNotification: (input) => tauriNotification.sendNotification(input),
  };
})();
