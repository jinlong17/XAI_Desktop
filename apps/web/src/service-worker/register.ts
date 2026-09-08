export function registerServiceWorker() {
  if (typeof window === "undefined") {
    return;
  }

  // The shell service worker precaches assets with a cache-first strategy. Under
  // the Vite dev server that traps stale modules (edits don't appear until the
  // SW + its caches are manually cleared), so it is production-only. In dev we
  // also proactively unregister any SW left over from a previous prod build.
  if (import.meta.env.DEV) {
    if ("serviceWorker" in navigator) {
      void navigator.serviceWorker.getRegistrations().then((regs) => {
        for (const reg of regs) void reg.unregister();
      });
      if (window.caches) {
        void caches.keys().then((keys) => {
          for (const key of keys) void caches.delete(key);
        });
      }
    }
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
