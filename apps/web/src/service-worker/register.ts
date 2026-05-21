export function registerServiceWorker() {
  if (typeof window === "undefined") {
    return;
  }

  if ("serviceWorker" in navigator) {
    window.addEventListener("load", () => {
      void navigator.serviceWorker.register("/sw.js").catch(() => {
        // Service worker is optional for host bootstrap.
      });
    });
  }
}
