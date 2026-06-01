const THEME_MODE_STORAGE_KEY = "xai-dev-dashboard.themeMode.v1";
const THEME_ACCENT_STORAGE_KEY = "xai-dev-dashboard.accent.v1";
const THEME_DEFAULT_ACCENT = "#1a73e8";
const THEME_ACCENTS = [
  {label:"Blue", value:"#1a73e8"},
  {label:"Cyan", value:"#0f9fbc"},
  {label:"Green", value:"#1f9d55"},
  {label:"Purple", value:"#7c4dff"},
  {label:"Rose", value:"#e04759"},
  {label:"Amber", value:"#b56f00"}
];
const THEME_MODE_LABELS = {system:"跟随系统", light:"浅色模式", dark:"深色模式"};
const themeSystemQuery = window.matchMedia?.("(prefers-color-scheme: dark)");

function normalizeThemeMode(mode){
  return ["system", "light", "dark"].includes(mode) ? mode : "system";
}

function normalizeHexColor(value, fallback = THEME_DEFAULT_ACCENT){
  const hex = String(value || "").trim();
  return /^#[0-9a-f]{6}$/i.test(hex) ? hex.toLowerCase() : fallback;
}

function hexToRgb(hex){
  const normalized = normalizeHexColor(hex).slice(1);
  return {
    r:parseInt(normalized.slice(0, 2), 16),
    g:parseInt(normalized.slice(2, 4), 16),
    b:parseInt(normalized.slice(4, 6), 16)
  };
}

function readThemeSettings(){
  try{
    return {
      mode:normalizeThemeMode(localStorage.getItem(THEME_MODE_STORAGE_KEY) || "system"),
      accent:normalizeHexColor(localStorage.getItem(THEME_ACCENT_STORAGE_KEY) || THEME_DEFAULT_ACCENT)
    };
  }catch{
    return {mode:"system", accent:THEME_DEFAULT_ACCENT};
  }
}

function saveThemeSettings(settings){
  try{
    localStorage.setItem(THEME_MODE_STORAGE_KEY, normalizeThemeMode(settings.mode));
    localStorage.setItem(THEME_ACCENT_STORAGE_KEY, normalizeHexColor(settings.accent));
  }catch{}
}

function effectiveThemeFor(mode){
  const normalized = normalizeThemeMode(mode);
  if(normalized !== "system") return normalized;
  return themeSystemQuery?.matches ? "dark" : "light";
}

function applyThemeSettings(settings){
  const mode = normalizeThemeMode(settings.mode);
  const accent = normalizeHexColor(settings.accent);
  const effective = effectiveThemeFor(mode);
  const rgb = hexToRgb(accent);
  document.documentElement.dataset.themeMode = mode;
  document.documentElement.dataset.theme = effective;
  document.documentElement.style.setProperty("--theme-primary", accent);
  document.documentElement.style.setProperty("--theme-primary-rgb", `${rgb.r},${rgb.g},${rgb.b}`);
  return {mode, accent, effective};
}

function renderThemeControls(settings = readThemeSettings()){
  const state = applyThemeSettings(settings);
  const status = document.getElementById("themeStatusText");
  const accentText = document.getElementById("themeAccentText");
  const picker = document.getElementById("themeAccentPicker");
  if(status){
    status.textContent = state.mode === "system"
      ? `跟随系统 · ${state.effective === "dark" ? "深色" : "浅色"}`
      : THEME_MODE_LABELS[state.mode];
  }
  document.querySelectorAll("#themeModeControl [data-theme-mode]").forEach(button => {
    button.classList.toggle("is-active", button.dataset.themeMode === state.mode);
  });
  const matchedAccent = THEME_ACCENTS.find(item => item.value === state.accent);
  if(accentText) accentText.textContent = matchedAccent?.label || "自定义";
  if(picker) picker.value = state.accent;
  document.querySelectorAll("[data-theme-accent]").forEach(button => {
    button.classList.toggle("is-active", button.dataset.themeAccent === state.accent);
  });
}

function initThemeSettings(){
  const swatches = document.getElementById("themeAccentSwatches");
  if(swatches){
    swatches.innerHTML = THEME_ACCENTS.map(item => `
      <button class="theme-swatch" data-theme-accent="${h(item.value)}" type="button" aria-label="主色调 ${h(item.label)}" title="${h(item.label)}" style="--swatch:${h(item.value)}"></button>
    `).join("");
  }
  renderThemeControls();
  document.querySelectorAll("#themeModeControl [data-theme-mode]").forEach(button => {
    button.addEventListener("click", () => {
      const settings = {...readThemeSettings(), mode:button.dataset.themeMode};
      applyThemeSettings(settings);
      saveThemeSettings(settings);
      renderThemeControls(settings);
    });
  });
  document.querySelectorAll("[data-theme-accent]").forEach(button => {
    button.addEventListener("click", () => {
      const settings = {...readThemeSettings(), accent:button.dataset.themeAccent};
      applyThemeSettings(settings);
      saveThemeSettings(settings);
      renderThemeControls(settings);
    });
  });
  document.getElementById("themeAccentPicker")?.addEventListener("input", event => {
    const settings = {...readThemeSettings(), accent:normalizeHexColor(event.target.value)};
    applyThemeSettings(settings);
    saveThemeSettings(settings);
    renderThemeControls(settings);
  });
  const systemHandler = () => {
    const settings = readThemeSettings();
    if(settings.mode === "system"){
      applyThemeSettings(settings);
      renderThemeControls(settings);
    }
  };
  themeSystemQuery?.addEventListener?.("change", systemHandler);
  themeSystemQuery?.addListener?.(systemHandler);
}
