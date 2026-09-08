import { useEffect } from "react";
import { applyTheme, type Theme } from "@repo/plugin-web-tokens";

function readStoredTheme(): Theme {
  if (typeof localStorage === "undefined") return "light";
  try {
    const raw = localStorage.getItem("xai_pref_theme");
    if (raw === null) return "light";
    const value = JSON.parse(raw);
    return value === "dark" || value === "system" ? value : "light";
  } catch {
    return "light";
  }
}

export function NotFoundPage() {
  useEffect(() => {
    const theme = readStoredTheme();
    applyTheme(theme);
    if (theme !== "system") return;

    const mq = window.matchMedia("(prefers-color-scheme: dark)");
    const onChange = () => applyTheme("system");
    mq.addEventListener("change", onChange);
    return () => mq.removeEventListener("change", onChange);
  }, []);

  return (
    <main className="host-page">
      <h1>Not Found</h1>
      <p>Unknown route.</p>
    </main>
  );
}
