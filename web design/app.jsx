/* ============================================================
   XAI Console — App root
   ============================================================ */
const { useState, useEffect } = React;

function App(){
  const [module, setModule]   = useState("dashboard");
  const [lang, setLang]       = useState("en");
  const [theme, setTheme]     = useState("light");
  const [density, setDensity] = useState("comfortable");
  const [fontScale, setFontScale] = useState(1);
  const [petOn, setPetOn]     = useState(true);
  const [accentHue, setAccentHue] = useState(() => {
    try { return parseFloat(localStorage.getItem("xai_accent_hue")) || 165; } catch(e){ return 165; }
  });
  const [railPos, setRailPos] = useState(() => {
    try { return localStorage.getItem("xai_rail_pos") || "left"; } catch(e){ return "left"; }
  });
  const [bgTone, setBgTone] = useState(() => {
    try { return localStorage.getItem("xai_bg_tone") || "default"; } catch(e){ return "default"; }
  });

  // Apply theme / density / font-scale / accent to <html>
  useEffect(() => {
    const root = document.documentElement;
    const sysDark = window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches;
    const t = theme === "system" ? (sysDark ? "dark" : "light") : theme;
    root.setAttribute("data-theme", t);
  }, [theme]);
  useEffect(() => { document.documentElement.setAttribute("data-density", density); }, [density]);
  useEffect(() => { document.documentElement.style.fontSize = (16 * fontScale) + "px"; }, [fontScale]);
  useEffect(() => {
    document.documentElement.style.setProperty("--accent-hue", accentHue);
    try { localStorage.setItem("xai_accent_hue", String(accentHue)); } catch(e){}
  }, [accentHue]);
  useEffect(() => {
    try { localStorage.setItem("xai_rail_pos", railPos); } catch(e){}
  }, [railPos]);
  useEffect(() => {
    document.documentElement.setAttribute("data-bg-tone", bgTone);
    try { localStorage.setItem("xai_bg_tone", bgTone); } catch(e){}
  }, [bgTone]);

  const Module =
    module === "tasks"      ? window.TasksModule :
    module === "habits"     ? window.HabitsModule :
    module === "pomodoro"   ? window.PomodoroModule :
    module === "calendar"   ? window.CalendarModule :
    module === "matrix"     ? window.MatrixModule :
    module === "countdown"  ? window.CountdownModule :
    module === "settings"   ? window.SettingsModule :
    module === "board"      ? window.BoardModule :
    module === "dashboard"  ? window.DashboardModule :
    module === "meditation" ? window.MeditationModule :
    module === "statistics" ? window.StatisticsModule :
    module === "ai"         ? window.AIModule :
    module === "search"     ? SearchModule :
    window.DashboardModule;

  return (
    <div className="app" data-rail-pos={railPos}>
      <window.AppRail
        module={module} setModule={setModule}
        lang={lang} petOn={petOn} setPetOn={setPetOn}
        railPos={railPos}/>
      <window.Topbar
        lang={lang} setLang={setLang}
        theme={theme} setTheme={setTheme}
        density={density} setDensity={setDensity}
        onOpenSettings={()=>setModule("settings")}/>
      <main className="app-main">
        <Module
          key={module + "_" + lang}
          lang={lang}
          setLang={setLang}
          theme={theme} setTheme={setTheme}
          density={density} setDensity={setDensity}
          fontScale={fontScale} setFontScale={setFontScale}
          accentHue={accentHue} setAccentHue={setAccentHue}
          railPos={railPos} setRailPos={setRailPos}
          bgTone={bgTone} setBgTone={setBgTone}
          goTo={setModule}/>
      </main>

      <window.DesktopPet lang={lang} on={petOn}/>
    </div>
  );
}

function SearchModule({ lang }){
  return (
    <div className="module module-search">
      <div className="search-empty">
        {lang === "zh"
          ? "在顶部搜索框中输入以查找任务、习惯或笔记…"
          : "Type in the search box above to find tasks, habits, or notes…"}
      </div>
    </div>
  );
}

ReactDOM.createRoot(document.getElementById("root")).render(<App/>);
