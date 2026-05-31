(() => {
    const modeKey = "xai-dev-dashboard.themeMode.v1";
    const accentKey = "xai-dev-dashboard.accent.v1";
    const root = document.documentElement;
    const validMode = value => ["system", "light", "dark"].includes(value);
    const validHex = value => /^#[0-9a-f]{6}$/i.test(value || "");
    const hexToRgb = value => {
      const parsed = Number.parseInt(value.slice(1), 16);
      return `${(parsed >> 16) & 255},${(parsed >> 8) & 255},${parsed & 255}`;
    };
    try{
      const mode = localStorage.getItem(modeKey) || "system";
      const accent = localStorage.getItem(accentKey) || "#1a73e8";
      const systemDark = window.matchMedia?.("(prefers-color-scheme: dark)")?.matches ?? false;
      const effective = mode === "system" ? (systemDark ? "dark" : "light") : mode;
      root.dataset.themeMode = validMode(mode) ? mode : "system";
      root.dataset.theme = validMode(effective) ? effective : "light";
      if(validHex(accent)){
        root.style.setProperty("--theme-primary", accent);
        root.style.setProperty("--theme-primary-rgb", hexToRgb(accent));
      }
    }catch{
      root.dataset.themeMode = "system";
    }
  })();
