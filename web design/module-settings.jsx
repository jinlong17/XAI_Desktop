/* ============================================================
   Settings module — comprehensive panes
   Account / Premium / Features / Smart Lists / Notifications
   Date & Time / Appearance / More / Integrations / Collaborate
   Sticky Note / Hotkeys / About
   ============================================================ */
const Icon = window.Icon;

/* ---------- Persisted prefs helpers ---------- */
function usePref(key, initial){
  const [val, setVal] = useState(() => {
    try {
      const raw = localStorage.getItem("xai_pref_" + key);
      return raw == null ? initial : JSON.parse(raw);
    } catch(e){ return initial; }
  });
  useEffect(()=>{
    try { localStorage.setItem("xai_pref_" + key, JSON.stringify(val)); } catch(e){}
  }, [val]);
  return [val, setVal];
}

function SettingsModule({ lang, setLang, theme, setTheme, density, setDensity, fontScale, setFontScale, accentHue, setAccentHue, railPos, setRailPos, bgTone, setBgTone }){
  const { s } = window.useI18n(lang);
  const [section, setSection] = useState("account");

  const groups = [
    { items: [
      { id:"account",  icon:"user",   key:"account" },
      { id:"premium",  icon:"star",   key:"premium" },
    ]},
    { items: [
      { id:"features",   icon:"box",       key:"features" },
      { id:"smart_lists",icon:"sparkle",   key:"smart_lists" },
      { id:"notifications", icon:"bell",   key:"notifications" },
      { id:"date_time",  icon:"clock",     key:"date_time" },
      { id:"appearance", icon:"type",      key:"appearance" },
      { id:"more",       icon:"dots",      key:"more" },
    ]},
    { items: [
      { id:"integrations", icon:"download", key:"integrations" },
      { id:"collaborate",  icon:"user",     key:"collaborate" },
      { id:"sticky",       icon:"note",     key:"sticky" },
      { id:"hotkeys",      icon:"grip",     key:"hotkeys" },
    ]},
    { items: [
      { id:"about", icon:"help", key:"about" },
    ]},
  ];

  return (
    <div className="module module-settings">
      <div className="settings-shell panel">
        <aside className="settings-sidebar">
          <h2 className="settings-h">{s("settings.title")}</h2>
          {groups.map((g, gi) => (
            <div key={gi} className="settings-group">
              {g.items.map(it => (
                <div key={it.id}
                  className="list-row"
                  data-active={section===it.id}
                  onClick={()=>setSection(it.id)}>
                  <Icon name={it.icon} size={15}/>
                  <span className="grow">{s("settings."+it.key)}</span>
                </div>
              ))}
            </div>
          ))}
        </aside>

        <section className="settings-detail">
          {section === "account" && <AccountPane lang={lang}/>}
          {section === "premium" && <PremiumPane lang={lang}/>}
          {section === "features" && <FeaturesPane lang={lang}/>}
          {section === "smart_lists" && <SmartListsPane lang={lang}/>}
          {section === "notifications" && <NotificationsPane lang={lang}/>}
          {section === "date_time" && <DateTimePane lang={lang}/>}
          {section === "appearance" && (
            <AppearancePane lang={lang} setLang={setLang}
              theme={theme} setTheme={setTheme}
              density={density} setDensity={setDensity}
              fontScale={fontScale} setFontScale={setFontScale}
              accentHue={accentHue} setAccentHue={setAccentHue}
              railPos={railPos} setRailPos={setRailPos}
              bgTone={bgTone} setBgTone={setBgTone}/>
          )}
          {section === "more" && <MorePane lang={lang}/>}
          {section === "integrations" && <IntegrationsPane lang={lang}/>}
          {section === "collaborate" && <CollaboratePane lang={lang}/>}
          {section === "sticky" && <StickyNotePane lang={lang}/>}
          {section === "hotkeys" && <HotkeysPane lang={lang}/>}
          {section === "about" && <AboutPane lang={lang}/>}
        </section>
      </div>
    </div>
  );
}

/* ============================================================
   ACCOUNT
   ============================================================ */
function AccountPane({ lang }){
  const { s } = window.useI18n(lang);
  return (
    <div className="account-pane">
      <div className="acct-avatar">
        <svg viewBox="0 0 96 96" width="96" height="96">
          <defs>
            <linearGradient id="agf" x1="0" x2="1" y1="0" y2="1">
              <stop offset="0" stopColor="#d8c8b7"/>
              <stop offset="1" stopColor="#a08877"/>
            </linearGradient>
          </defs>
          <circle cx="48" cy="48" r="48" fill="url(#agf)"/>
          <circle cx="48" cy="38" r="14" fill="#fff" opacity=".75"/>
          <ellipse cx="48" cy="78" rx="26" ry="18" fill="#fff" opacity=".55"/>
        </svg>
        <button className="acct-edit"><Icon name="plus" size={12}/></button>
      </div>
      <h3 className="acct-name">{lang==="zh" ? "百事可爱" : "Aki Chen"}</h3>
      <div className="acct-email">aki.chen@xai.app</div>
      <div className="acct-status">
        {s("settings.using_free")} <button className="acct-upgrade">{s("settings.upgrade_now")}</button>
      </div>
      <div className="acct-actions">
        <button className="btn ghost">{s("common.sign_out")}</button>
        <button className="acct-danger">{s("common.delete_account")}</button>
      </div>
    </div>
  );
}

/* ============================================================
   PREMIUM
   ============================================================ */
function PremiumPane({ lang }){
  const { s } = window.useI18n(lang);
  return (
    <div className="premium-pane">
      <h3 className="pane-title">{s("settings.premium")}</h3>
      <div className="premium-card">
        <div className="premium-emblem"><Icon name="star" size={26}/></div>
        <h4>{lang==="zh" ? "解锁高级功能" : "Unlock Premium Features"}</h4>
        <p>{lang==="zh"
          ? "完整日历视图、四象限矩阵、习惯统计、专注音效和无限倒计时。"
          : "Full calendar views, matrix, habit stats, focus sounds & unlimited countdowns."}</p>
        <button className="btn primary" style={{height:36, padding:"0 22px"}}>{s("settings.upgrade_now")}</button>
      </div>
    </div>
  );
}

/* ============================================================
   FEATURES — toggle modules on/off with preview thumbnails
   ============================================================ */
function FeaturesPane({ lang }){
  const { s } = window.useI18n(lang);
  const FEATURES = [
    { id:"calendar",   name:{en:"Calendar",        zh:"日历"},     desc:{en:"Manage your tasks with six calendar views.", zh:"用六种视图管理任务。"},        thumb:"cal" },
    { id:"matrix",     name:{en:"Eisenhower Matrix",zh:"四象限"},  desc:{en:"Focus on what's important and urgent.",     zh:"专注重要紧急。"},              thumb:"matrix" },
    { id:"pomodoro",   name:{en:"Pomodoro",        zh:"番茄钟"},   desc:{en:"Use the Pomo timer to keep focus.",        zh:"用番茄钟保持专注。"},          thumb:"pomo" },
    { id:"habits",     name:{en:"Habit Tracker",   zh:"习惯追踪"}, desc:{en:"Develop a habit and keep track of it.",   zh:"养成习惯并追踪。"},            thumb:"habits" },
    { id:"countdown",  name:{en:"Countdown",       zh:"倒计时"},   desc:{en:"Remember every special day.",              zh:"记住每个特别的日子。"},        thumb:"count" },
    { id:"board",      name:{en:"Project Boards",  zh:"项目板"},   desc:{en:"Trello-style boards with multiple views.", zh:"看板与多视图项目管理。"},      thumb:"board" },
    { id:"meditation", name:{en:"Meditation",      zh:"冥想"},     desc:{en:"Full-screen breathing with ambient scenes.", zh:"沉浸式呼吸与环境场景。"},     thumb:"med" },
    { id:"pet",        name:{en:"Desktop Pet",     zh:"桌宠"},     desc:{en:"A draggable little companion on your desktop.", zh:"可拖拽的桌面小伙伴。"},   thumb:"pet" },
  ];
  const [enabled, setEnabled] = usePref("features", Object.fromEntries(FEATURES.map(f => [f.id, true])));
  const toggle = (id) => setEnabled({ ...enabled, [id]: !enabled[id] });

  return (
    <div className="features-pane">
      <h3 className="pane-title">{s("settings.features")}</h3>
      <div className="features-grid">
        {FEATURES.map(f => (
          <div key={f.id} className="feat-card">
            <div className="feat-head">
              <div className="feat-text">
                <div className="feat-name">{f.name[lang]}</div>
                <div className="feat-desc">{f.desc[lang]}</div>
              </div>
              <Toggle on={enabled[f.id]} onChange={()=>toggle(f.id)}/>
            </div>
            <div className={"feat-thumb feat-thumb-" + f.thumb}>
              <FeatureThumb kind={f.thumb}/>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function FeatureThumb({ kind }){
  // Tiny SVG previews per module
  if (kind === "cal") return (
    <svg viewBox="0 0 280 130" preserveAspectRatio="xMidYMid slice">
      <rect width="280" height="130" fill="oklch(96% 0.02 165)"/>
      {Array.from({length:5}).map((_,r)=>Array.from({length:7}).map((_,c)=>{
        const x=10+c*38, y=14+r*22;
        return <g key={r+"-"+c}>
          <rect x={x} y={y} width="34" height="18" rx="2" fill="white"/>
          {Math.random()>.6 && <rect x={x+2} y={y+4} width={20+Math.random()*10} height="4" rx="2" fill={["#9bd1c5","#f5c97b","#c4b6e9","#f5a3a3"][r%4]}/>}
        </g>;
      }))}
    </svg>
  );
  if (kind === "matrix") return (
    <svg viewBox="0 0 280 130" preserveAspectRatio="xMidYMid slice">
      <rect width="280" height="130" fill="white"/>
      <line x1="140" y1="0" x2="140" y2="130" stroke="#e5e5e5"/>
      <line x1="0" y1="65" x2="280" y2="65" stroke="#e5e5e5"/>
      {[[20,15,"#f5a3a3"],[160,15,"#f5c97b"],[20,80,"#a0c4ed"],[160,80,"#9bd1c5"]].map(([x,y,c],i)=>(
        <g key={i}>
          <circle cx={x} cy={y+4} r="3" fill={c}/>
          <rect x={x+8} y={y+2} width="40" height="4" fill="#ddd"/>
          <rect x={x+8} y={y+10} width="30" height="3" fill="#eee"/>
          <rect x={x+8} y={y+18} width="50" height="3" fill="#eee"/>
        </g>
      ))}
    </svg>
  );
  if (kind === "pomo") return (
    <svg viewBox="0 0 280 130" preserveAspectRatio="xMidYMid slice">
      <rect width="280" height="130" fill="oklch(96% 0.04 30)"/>
      <circle cx="100" cy="65" r="34" fill="none" stroke="white" strokeWidth="3"/>
      <circle cx="100" cy="65" r="34" fill="none" stroke="oklch(60% 0.16 30)" strokeWidth="3" strokeDasharray="160 50" transform="rotate(-90 100 65)"/>
      <text x="100" y="71" fontSize="14" textAnchor="middle" fill="oklch(40% 0.10 30)" fontWeight="700">16:36</text>
      <rect x="160" y="40" width="100" height="6" rx="3" fill="#eee"/>
      <rect x="160" y="54" width="80" height="6" rx="3" fill="#eee"/>
      <rect x="160" y="68" width="100" height="6" rx="3" fill="#eee"/>
      <rect x="160" y="82" width="60" height="6" rx="3" fill="#eee"/>
    </svg>
  );
  if (kind === "habits") return (
    <svg viewBox="0 0 280 130" preserveAspectRatio="xMidYMid slice">
      <rect width="280" height="130" fill="oklch(94% 0.06 145)"/>
      {Array.from({length:4}).map((_,r)=>(
        <g key={r}>
          <circle cx="22" cy={22+r*26} r="9" fill="white"/>
          <rect x="38" y={18+r*26} width="60" height="4" rx="2" fill="white"/>
          <rect x="38" y={26+r*26} width="40" height="3" rx="2" fill="white" opacity=".6"/>
          {Array.from({length:7}).map((_,c)=>(
            <circle key={c} cx={120+c*20} cy={22+r*26} r="4"
              fill={Math.random()>.4?"oklch(60% 0.13 145)":"none"}
              stroke={Math.random()>.4?"none":"white"} strokeWidth="1"/>
          ))}
        </g>
      ))}
    </svg>
  );
  if (kind === "count") return (
    <svg viewBox="0 0 280 130" preserveAspectRatio="xMidYMid slice">
      <rect width="280" height="130" fill="oklch(96% 0.02 165)"/>
      {[["#6c5b4b","--"],["#fff","132"],["#2a3d6b","224"],["#fff","260"]].map(([c,n],i)=>(
        <g key={i}>
          <rect x={10+i*65} y="22" width="60" height="86" rx="6" fill={c} stroke={c==="#fff"?"#e5e5e5":"none"}/>
          <text x={40+i*65} y="78" fontSize="18" textAnchor="middle" fill={c==="#fff"?"oklch(58% 0.10 165)":"white"} fontWeight="600">{n}</text>
        </g>
      ))}
    </svg>
  );
  if (kind === "board") return (
    <svg viewBox="0 0 280 130" preserveAspectRatio="xMidYMid slice">
      <rect width="280" height="130" fill="oklch(94% 0.02 220)"/>
      {[10,80,150,220].map((x,i)=>(
        <g key={i}>
          <rect x={x} y="10" width="58" height="110" rx="6" fill="white"/>
          <rect x={x+6} y="16" width="40" height="4" fill="#ddd"/>
          {Array.from({length:3}).map((_,c)=>(
            <rect key={c} x={x+6} y={28+c*26} width="46" height="20" rx="3" fill={["#9bd1c5","#a0c4ed","#f5c97b"][c]} opacity=".7"/>
          ))}
        </g>
      ))}
    </svg>
  );
  if (kind === "med") return (
    <svg viewBox="0 0 280 130" preserveAspectRatio="xMidYMid slice">
      <defs><linearGradient id="medg" x1="0" x2="1" y1="0" y2="1">
        <stop offset="0" stopColor="oklch(45% 0.07 145)"/>
        <stop offset="1" stopColor="oklch(20% 0.04 145)"/>
      </linearGradient></defs>
      <rect width="280" height="130" fill="url(#medg)"/>
      <circle cx="140" cy="65" r="30" fill="none" stroke="oklch(82% 0.10 145)" strokeWidth="1" opacity=".6"/>
      <circle cx="140" cy="65" r="18" fill="none" stroke="oklch(82% 0.10 145)" strokeWidth="1.5"/>
      <text x="140" y="69" fontSize="14" textAnchor="middle" fill="oklch(85% 0.08 145)" fontWeight="300">03:44</text>
    </svg>
  );
  if (kind === "pet") return (
    <svg viewBox="0 0 280 130" preserveAspectRatio="xMidYMid slice">
      <rect width="280" height="130" fill="oklch(96% 0.02 165)"/>
      <ellipse cx="140" cy="80" rx="32" ry="30" fill="oklch(70% 0.10 165)"/>
      <ellipse cx="140" cy="86" rx="20" ry="18" fill="oklch(94% 0.04 165)"/>
      <circle cx="132" cy="75" r="2.5" fill="#222"/><circle cx="148" cy="75" r="2.5" fill="#222"/>
      <path d="M134 84 Q140 88 146 84" fill="none" stroke="#222" strokeWidth="1.5" strokeLinecap="round"/>
      <path d="M118 50 Q112 36 126 38 Q130 44 126 52 Z" fill="oklch(58% 0.13 145)"/>
      <path d="M162 50 Q168 36 154 38 Q150 44 154 52 Z" fill="oklch(58% 0.13 145)"/>
    </svg>
  );
  return <div className="thumb-blank"/>;
}

/* ============================================================
   SMART LISTS — show/hide each list
   ============================================================ */
function SmartListsPane({ lang }){
  const { s } = window.useI18n(lang);
  const SECTIONS = [
    {
      group: lang==="zh" ? "默认清单" : "Default lists",
      items: [
        { id:"all",       icon:"inbox",   name:{en:"All", zh:"全部"} },
        { id:"today",     icon:"sun",     name:{en:"Today", zh:"今天"} },
        { id:"tomorrow",  icon:"sunrise", name:{en:"Tomorrow", zh:"明天"} },
        { id:"next7",     icon:"calendar",name:{en:"Next 7 Days", zh:"最近 7 天"} },
        { id:"assigned",  icon:"user",    name:{en:"Assigned to Me", zh:"分配给我"}, defaultMode:"if-not-empty" },
        { id:"inbox",     icon:"tray",    name:{en:"Inbox", zh:"收件箱"} },
        { id:"summary",   icon:"chart",   name:{en:"Summary", zh:"总览"} },
      ],
    },
    {
      group: lang==="zh" ? "组织" : "Organize",
      items: [
        { id:"tags",    icon:"tag",     name:{en:"Tags", zh:"标签"} },
        { id:"filters", icon:"filter",  name:{en:"Filters", zh:"筛选器"} },
      ],
    },
    {
      group: lang==="zh" ? "其他" : "Others",
      items: [
        { id:"completed", icon:"check",  name:{en:"Completed", zh:"已完成"} },
        { id:"wont_do",   icon:"close",  name:{en:"Won't Do", zh:"不做了"}, defaultMode:"if-not-empty" },
        { id:"trash",     icon:"trash",  name:{en:"Trash", zh:"回收站"} },
      ],
    },
  ];
  const defaults = {};
  SECTIONS.forEach(g => g.items.forEach(it => defaults[it.id] = it.defaultMode || "show"));
  const [modes, setModes] = usePref("smart_lists", defaults);

  const MODE_LABELS = lang==="zh"
    ? { show:"显示", "if-not-empty":"不空显示", hide:"隐藏" }
    : { show:"Show", "if-not-empty":"Show if not empty", hide:"Hide" };

  return (
    <div className="smart-lists-pane">
      <h3 className="pane-title">{s("settings.smart_lists")}</h3>
      {SECTIONS.map((g, gi) => (
        <div key={gi} className="sl-section">
          {SECTIONS.length > 1 && <div className="sl-group">{g.group}</div>}
          <div className="sl-rows">
            {g.items.map(it => (
              <div key={it.id} className="sl-row">
                <Icon name={it.icon} size={15} color="var(--text-2)"/>
                <span className="sl-name">{it.name[lang]}</span>
                <span className="grow"></span>
                <select className="sl-select"
                  value={modes[it.id] || "show"}
                  onChange={(e)=>setModes({ ...modes, [it.id]: e.target.value })}>
                  {Object.entries(MODE_LABELS).map(([v,l]) => (
                    <option key={v} value={v}>{l}</option>
                  ))}
                </select>
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}

/* ============================================================
   NOTIFICATIONS
   ============================================================ */
function NotificationsPane({ lang }){
  const { s } = window.useI18n(lang);
  const [enabled, setEnabled]     = usePref("notif_enabled", true);
  const [doneSound, setDoneSound] = usePref("notif_done_sound", "subtle");
  const [pushTask, setPushTask]   = usePref("notif_push_task", true);
  const [pushPomo, setPushPomo]   = usePref("notif_push_pomo", true);
  const [pushHabit, setPushHabit] = usePref("notif_push_habit", false);
  const [quiet, setQuiet]         = usePref("notif_quiet", false);
  const [quietStart, setQuietStart] = usePref("notif_quiet_start", "22:00");
  const [quietEnd, setQuietEnd]     = usePref("notif_quiet_end", "07:00");

  return (
    <div className="notif-pane">
      <h3 className="pane-title">{s("settings.notifications")}</h3>

      <SectionBlock>
        <SettingRow label={lang==="zh"?"启用通知":"Enable notifications"}>
          <Toggle on={enabled} onChange={()=>setEnabled(!enabled)}/>
        </SettingRow>
      </SectionBlock>

      <div className="sl-group" style={{marginTop:18}}>{lang==="zh"?"提醒类型":"Notification types"}</div>
      <SectionBlock>
        <SettingRow label={lang==="zh"?"任务到期":"Task due"}>
          <Toggle on={pushTask} onChange={()=>setPushTask(!pushTask)}/>
        </SettingRow>
        <SettingRow label={lang==="zh"?"番茄钟结束":"Pomodoro complete"}>
          <Toggle on={pushPomo} onChange={()=>setPushPomo(!pushPomo)}/>
        </SettingRow>
        <SettingRow label={lang==="zh"?"习惯提醒":"Habit reminder"}>
          <Toggle on={pushHabit} onChange={()=>setPushHabit(!pushHabit)}/>
        </SettingRow>
      </SectionBlock>

      <div className="sl-group" style={{marginTop:18}}>{lang==="zh"?"完成音效":"Completion sound"}</div>
      <SectionBlock>
        <SettingRow label={lang==="zh"?"音效":"Sound"} desc={lang==="zh"?"任务完成时播放":"Plays when a task is completed"}>
          <select className="sl-select"
            value={doneSound}
            onChange={e=>setDoneSound(e.target.value)}>
            <option value="none">{lang==="zh"?"无":"None"}</option>
            <option value="subtle">{lang==="zh"?"轻柔":"Subtle"}</option>
            <option value="chime">{lang==="zh"?"清脆":"Chime"}</option>
            <option value="bell">{lang==="zh"?"铃铛":"Bell"}</option>
            <option value="pop">{lang==="zh"?"弹响":"Pop"}</option>
          </select>
        </SettingRow>
      </SectionBlock>

      <div className="sl-group" style={{marginTop:18}}>{lang==="zh"?"勿扰":"Do not disturb"}</div>
      <SectionBlock>
        <SettingRow label={lang==="zh"?"启用勿扰":"Enable quiet hours"}>
          <Toggle on={quiet} onChange={()=>setQuiet(!quiet)}/>
        </SettingRow>
        {quiet && (
          <SettingRow label={lang==="zh"?"时段":"Quiet hours"}>
            <div className="time-range">
              <input type="time" value={quietStart} onChange={e=>setQuietStart(e.target.value)}/>
              <span className="muted">→</span>
              <input type="time" value={quietEnd} onChange={e=>setQuietEnd(e.target.value)}/>
            </div>
          </SettingRow>
        )}
      </SectionBlock>
    </div>
  );
}

/* ============================================================
   DATE & TIME
   ============================================================ */
function DateTimePane({ lang }){
  const { s } = window.useI18n(lang);
  const [startWeek, setStartWeek] = usePref("startweek", "monday");
  const [showLunar, setLunar]   = usePref("dt_lunar", true);
  const [showWk, setShowWk]     = usePref("dt_wk", true);
  const [showHoliday, setShowHoliday] = usePref("dt_holiday", true);
  const [tz, setTz] = usePref("dt_tz", true);

  return (
    <div className="dt-pane">
      <h3 className="pane-title">{s("settings.date_time")}</h3>

      <SectionBlock>
        <SettingRow label={lang==="zh"?"周开始":"Start week on"}>
          <select className="sl-select" value={startWeek} onChange={e=>setStartWeek(e.target.value)}>
            <option value="monday">{lang==="zh"?"周一":"Monday"}</option>
            <option value="sunday">{lang==="zh"?"周日":"Sunday"}</option>
            <option value="saturday">{lang==="zh"?"周六":"Saturday"}</option>
          </select>
        </SettingRow>
      </SectionBlock>

      <SectionBlock style={{marginTop:14}}>
        <SettingRow label={lang==="zh"?"显示农历":"Show Lunar Calendar"}>
          <Toggle on={showLunar} onChange={()=>setLunar(!showLunar)}/>
        </SettingRow>
        <SettingRow label={lang==="zh"?"显示周数 (W)":"Show Week Numbers (W)"}>
          <Toggle on={showWk} onChange={()=>setShowWk(!showWk)}/>
        </SettingRow>
        <SettingRow label={lang==="zh"?"显示节假日":"Show Holidays"}>
          <Toggle on={showHoliday} onChange={()=>setShowHoliday(!showHoliday)}/>
        </SettingRow>
      </SectionBlock>

      <SectionBlock style={{marginTop:14}}>
        <SettingRow label={lang==="zh"?"时区":"Time Zone"}
          desc={lang==="zh"?"启用后可在设置任务时间时选择时区。":"If enabled, you can select the time zone when setting time for tasks."}>
          <Toggle on={tz} onChange={()=>setTz(!tz)}/>
        </SettingRow>
      </SectionBlock>
    </div>
  );
}

/* ============================================================
   APPEARANCE (kept from earlier, with accent picker)
   ============================================================ */
function AppearancePane({ lang, setLang, theme, setTheme, density, setDensity, fontScale, setFontScale, accentHue, setAccentHue, railPos, setRailPos, bgTone, setBgTone }){
  const { s } = window.useI18n(lang);
  const [saved, setSaved] = useState(false);
  const BG_TONES = [
    { id:"default",  name:{en:"Sage",     zh:"鼠尾草"}, hue:165 },
    { id:"cream",    name:{en:"Cream",    zh:"奶油"},   hue:55 },
    { id:"mist",     name:{en:"Mist",     zh:"薄雾"},   hue:230 },
    { id:"lavender", name:{en:"Lavender", zh:"薰衣草"}, hue:295 },
    { id:"peach",    name:{en:"Peach",    zh:"蜜桃"},   hue:35 },
    { id:"graphite", name:{en:"Graphite", zh:"石墨"},   hue:220 },
  ];
  const HUE_PRESETS = [
    { id:"sage",    hue:165, name:{en:"Sage",    zh:"鼠尾草"} },
    { id:"ocean",   hue:230, name:{en:"Ocean",   zh:"海洋"} },
    { id:"sunset",  hue:35,  name:{en:"Sunset",  zh:"日落"} },
    { id:"rose",    hue:355, name:{en:"Rose",    zh:"玫瑰"} },
    { id:"violet",  hue:295, name:{en:"Violet",  zh:"紫罗兰"} },
    { id:"amber",   hue:75,  name:{en:"Amber",   zh:"琥珀"} },
  ];
  return (
    <div className="appearance-pane">
      <h3 className="pane-title">{s("settings.appearance")}</h3>

      <SettingRow label={s("settings.language")} desc={lang==="zh" ? "界面语言" : "Interface language"}>
        <div className="seg">
          <button aria-selected={lang==="en"} onClick={()=>setLang("en")}>English</button>
          <button aria-selected={lang==="zh"} onClick={()=>setLang("zh")}>简体中文</button>
        </div>
      </SettingRow>

      <SettingRow label={s("settings.theme")} desc={lang==="zh" ? "浅色 / 深色 / 跟随系统" : "Light / Dark / System"}>
        <div className="theme-cards">
          {[
            { id:"light", icon:"sun",     label: s("settings.light") },
            { id:"dark",  icon:"moon",    label: s("settings.dark") },
            { id:"system",icon:"monitor", label: s("settings.system") },
          ].map(opt => (
            <button key={opt.id}
              className={"theme-card" + (theme===opt.id?" active":"")}
              onClick={()=>setTheme(opt.id)}>
              <div className={"theme-preview tp-"+opt.id}>
                <div className="tp-bar"></div>
                <div className="tp-body">
                  <div className="tp-line"></div>
                  <div className="tp-line short"></div>
                  <div className="tp-line"></div>
                </div>
              </div>
              <span className="theme-label"><Icon name={opt.icon} size={13}/> {opt.label}</span>
            </button>
          ))}
        </div>
      </SettingRow>

      <SettingRow label={s("settings.density")} desc={lang==="zh" ? "列表行高与卡片密度" : "Row height & card density"}>
        <div className="seg">
          <button aria-selected={density==="comfortable"} onClick={()=>setDensity("comfortable")}>{s("settings.comfortable")}</button>
          <button aria-selected={density==="compact"} onClick={()=>setDensity("compact")}>{s("settings.compact")}</button>
        </div>
      </SettingRow>

      <SettingRow label={lang==="zh" ? "主题色" : "Accent color"} desc={lang==="zh" ? "影响主操作色、链接、选中态" : "Drives primary actions, links, active states"}>
        <div className="accent-pickers">
          <div className="accent-swatches">
            {HUE_PRESETS.map(p => (
              <button key={p.id}
                className={"accent-sw" + (Math.abs(accentHue - p.hue) < 3 ? " active" : "")}
                style={{ background: `oklch(60% 0.10 ${p.hue})` }}
                onClick={()=>setAccentHue(p.hue)}
                title={p.name[lang]}>
                {Math.abs(accentHue - p.hue) < 3 && <Icon name="check2" size={12} color="#fff"/>}
              </button>
            ))}
          </div>
          <div className="accent-slider-row">
            <span className="accent-hue-preview" style={{ background: `oklch(60% 0.10 ${accentHue})` }}></span>
            <input type="range" min="0" max="360" step="1"
              className="hue-slider"
              value={accentHue}
              onChange={(e)=>setAccentHue(parseFloat(e.target.value))}/>
            <span className="slider-val mono">{Math.round(accentHue)}°</span>
          </div>
        </div>
      </SettingRow>

      <SettingRow label={lang==="zh" ? "背景调子" : "Background palette"} desc={lang==="zh" ? "改变全局背景与面板色调" : "Changes global background and panel tones"}>
        <div className="bg-tones">
          {BG_TONES.map(t => (
            <button key={t.id}
              className={"bg-tone-card bgt-"+t.id+(bgTone===t.id?" active":"")}
              onClick={()=>{ setBgTone(t.id); setAccentHue(t.hue); }}
              title={t.name[lang]}>
              <div className="bgt-preview">
                <div className="bgt-bg"/>
                <div className="bgt-panel"/>
                <div className="bgt-dot" style={{background:`oklch(60% 0.10 ${t.hue})`}}/>
              </div>
              <span className="bgt-name">{t.name[lang]}</span>
            </button>
          ))}
        </div>
      </SettingRow>

      <SettingRow label={lang==="zh" ? "侧栏位置" : "Sidebar position"} desc={lang==="zh" ? "选择导航栏出现在哪个方向" : "Where the navigation rail appears"}>
        <div className="rail-pos-grid">
          {[
            { id:"left",   label: lang==="zh"?"左侧":"Left" },
            { id:"right",  label: lang==="zh"?"右侧":"Right" },
            { id:"top",    label: lang==="zh"?"顶部":"Top" },
            { id:"bottom", label: lang==="zh"?"底部":"Bottom (Dock)" },
          ].map(opt => (
            <button key={opt.id}
              className={"rail-pos-card rp-"+opt.id+(railPos===opt.id?" active":"")}
              onClick={()=>setRailPos(opt.id)}>
              <div className="rp-preview">
                <div className="rp-shell">
                  <div className="rp-rail">
                    <span/><span/><span/><span/>
                  </div>
                  <div className="rp-body">
                    <div className="rp-line"/><div className="rp-line short"/><div className="rp-line"/>
                  </div>
                </div>
              </div>
              <span className="rp-label">{opt.label}</span>
            </button>
          ))}
        </div>
      </SettingRow>

      <SettingRow label={s("settings.font_scale")} desc={lang==="zh" ? "全局缩放" : "Global type scale"}>
        <div className="slider-row">
          <span className="mono">A</span>
          <input type="range" min="0.85" max="1.15" step="0.05"
            value={fontScale}
            onChange={(e)=>setFontScale(parseFloat(e.target.value))}/>
          <span className="mono" style={{fontSize:18}}>A</span>
          <span className="slider-val mono">{Math.round(fontScale*100)}%</span>
        </div>
      </SettingRow>

      <div className="pane-footer">
        <button className="btn ghost" onClick={()=>{
          setTheme("light"); setDensity("comfortable"); setFontScale(1);
          setAccentHue(165); setRailPos("left"); setBgTone("default");
        }}>
          {lang==="zh" ? "恢复默认" : "Reset to defaults"}
        </button>
        <button className={"btn primary pane-save" + (saved?" is-saved":"")} onClick={()=>{
          setSaved(true);
          setTimeout(()=>setSaved(false), 1800);
        }}>
          {saved
            ? <><Icon name="check2" size={14}/> {lang==="zh" ? "已保存" : "Saved"}</>
            : <>{lang==="zh" ? "保存生效" : "Save & apply"}</>}
        </button>
      </div>
    </div>
  );
}

/* ============================================================
   MORE — Smart Recognition + Task Defaults + Templates
   ============================================================ */
function MorePane({ lang }){
  const { s } = window.useI18n(lang);
  const [winType, setWinType] = usePref("more_win", "window");
  const [launch, setLaunch]   = usePref("more_launch", false);
  const [minimize, setMin]    = usePref("more_min", false);
  const [dateRec, setDateRec] = usePref("more_date_rec", true);
  const [removeDate, setRemoveDate] = usePref("more_remove_date", false);
  const [removeTags, setRemoveTags] = usePref("more_remove_tags", true);
  const [urlParse, setUrlParse]     = usePref("more_url_parse", true);
  const [defaultDate, setDefaultDate]       = usePref("more_default_date", "none");
  const [defaultRem, setDefaultRem]         = usePref("more_default_rem_due", "on_time");
  const [defaultRemAll, setDefaultRemAll]   = usePref("more_default_rem_all", "none");
  const [defaultPri, setDefaultPri]         = usePref("more_default_pri", "none");
  const [defaultTag, setDefaultTag]         = usePref("more_default_tag", "none");
  const [defaultList, setDefaultList]       = usePref("more_default_list", "inbox");
  const [addTo, setAddTo]                   = usePref("more_add_to", "top");
  const [overdueAt, setOverdueAt]           = usePref("more_overdue_at", "top");

  const TEMPLATES = [
    {
      name: lang==="zh" ? "每天工作前要做的几件事" : "Daily prep",
      items: lang==="zh"
        ? ["简单回顾昨天的情况","花点时间处理邮件…","查看智能清单 \"今…\"","确定今天最重要的 1…","确定今天最难的事…"]
        : ["Quick recap of yesterday","Spend time on email","Review smart list 'Tod…'","Pick the most important…","Pick the hardest task…"],
    },
    {
      name: lang==="zh" ? "每日记录" : "Daily journal",
      items: lang==="zh"
        ? ["今天完成了什么？","今天发生了哪些美好或值得关注的事？","今天遇到了哪些突发问题？"]
        : ["What did I finish today?","What was noteworthy?","What surprises came up?"],
    },
    {
      name: lang==="zh" ? "旅行必备物品" : "Travel checklist",
      items: lang==="zh"
        ? ["身份证 / 护照 / 学…","充电器 / 数据线","晴雨伞","易于携带的小背包","衣物：上衣 / 下装"]
        : ["ID / Passport / Visa…","Chargers / cables","Umbrella","Light backpack","Clothes: tops / bottoms"],
    },
  ];

  return (
    <div className="more-pane">
      <SectionBlock>
        <SettingRow label={lang==="zh"?"语言":"Language"}>
          <select className="sl-select" value="follow" onChange={()=>{}}>
            <option value="follow">{lang==="zh"?"跟随系统":"Follow System"}</option>
          </select>
        </SettingRow>
      </SectionBlock>

      <SectionBlock style={{marginTop:14}}>
        <SettingRow label={lang==="zh"?"启动时窗口类型":"Choose window type when launching"}>
          <select className="sl-select" value={winType} onChange={e=>setWinType(e.target.value)}>
            <option value="window">{lang==="zh"?"窗口":"Window"}</option>
            <option value="tray">{lang==="zh"?"托盘":"Tray"}</option>
            <option value="full">{lang==="zh"?"全屏":"Fullscreen"}</option>
          </select>
        </SettingRow>
        <SettingRow label={lang==="zh"?"登录时启动":"Launch at Login"}><Toggle on={launch} onChange={()=>setLaunch(!launch)}/></SettingRow>
        <SettingRow label={lang==="zh"?"自动启动时最小化":"Minimize app when auto launching"}><Toggle on={minimize} onChange={()=>setMin(!minimize)}/></SettingRow>
      </SectionBlock>

      <h4 className="pane-h-block">{lang==="zh"?"智能识别":"Smart Recognition"}</h4>
      <SectionBlock>
        <SettingRow label={lang==="zh"?"日期识别":"Date Recognition"}
          desc={lang==="zh"?"添加任务时识别日期并自动设置提醒。":"When adding tasks, recognize date and time information and automatically set reminders."}>
          <Toggle on={dateRec} onChange={()=>setDateRec(!dateRec)}/>
        </SettingRow>
        <SettingRow label={<><span className="cbx" style={{verticalAlign:"middle",marginRight:6}}/> {lang==="zh"?"移除任务中的文本":"Remove text in tasks"}</>}/>
        <SettingRow label={lang==="zh"?"标签识别":"Tag Recognition"}
          desc={lang==="zh"?"可选择保留或移除任务名中的标签。":"You can select to keep or remove tags from task name."}>
          <label className="check-inline" onClick={()=>setRemoveTags(!removeTags)}>
            <span className={"cbx" + (removeTags?" checked":"")}/>
            <span>{lang==="zh"?"从任务名移除标签":"Remove tags from task name"}</span>
          </label>
        </SettingRow>
        <SettingRow label={lang==="zh"?"URL 解析":"URL Parsing"}
          desc={lang==="zh"?"当任务名是链接时，解析为 URL 标题。":"When the task name is a URL, it will be parsed as the URL title."}>
          <Toggle on={urlParse} onChange={()=>setUrlParse(!urlParse)}/>
        </SettingRow>
      </SectionBlock>

      <h4 className="pane-h-block">{lang==="zh"?"任务默认值":"Task Default"} <Icon name="help" size={12} color="var(--text-3)"/></h4>
      <SectionBlock>
        <SettingRow label={lang==="zh"?"默认日期":"Default Date"}>
          <select className="sl-select" value={defaultDate} onChange={e=>setDefaultDate(e.target.value)}>
            <option value="none">{lang==="zh"?"无":"None"}</option>
            <option value="today">{lang==="zh"?"今天":"Today"}</option>
            <option value="tomorrow">{lang==="zh"?"明天":"Tomorrow"}</option>
          </select>
        </SettingRow>
        <SettingRow label={lang==="zh"?"默认提醒（带时间任务）":"Default Reminders (Due time task)"}>
          <select className="sl-select" value={defaultRem} onChange={e=>setDefaultRem(e.target.value)}>
            <option value="none">{lang==="zh"?"无":"None"}</option>
            <option value="on_time">{lang==="zh"?"准时":"On time"}</option>
            <option value="5min">{lang==="zh"?"提前 5 分":"5 min before"}</option>
            <option value="15min">{lang==="zh"?"提前 15 分":"15 min before"}</option>
          </select>
        </SettingRow>
        <SettingRow label={lang==="zh"?"默认提醒（全天任务）":"Default Reminders (All day task)"}>
          <select className="sl-select" value={defaultRemAll} onChange={e=>setDefaultRemAll(e.target.value)}>
            <option value="none">{lang==="zh"?"无":"None"}</option>
            <option value="9am">{lang==="zh"?"上午 9:00":"At 9:00 AM"}</option>
            <option value="day_before">{lang==="zh"?"前一日":"Day before"}</option>
          </select>
        </SettingRow>
      </SectionBlock>

      <SectionBlock style={{marginTop:14}}>
        <SettingRow label={lang==="zh"?"默认优先级":"Default Priority"}>
          <select className="sl-select" value={defaultPri} onChange={e=>setDefaultPri(e.target.value)}>
            <option value="none">{lang==="zh"?"无优先级":"No Priority"}</option>
            <option value="low">{lang==="zh"?"低":"Low"}</option>
            <option value="med">{lang==="zh"?"中":"Medium"}</option>
            <option value="high">{lang==="zh"?"高":"High"}</option>
          </select>
        </SettingRow>
        <SettingRow label={lang==="zh"?"默认标签":"Default Tag"}>
          <select className="sl-select" value={defaultTag} onChange={e=>setDefaultTag(e.target.value)}>
            <option value="none">{lang==="zh"?"无":"None"}</option>
            <option value="study">{lang==="zh"?"学习":"Study"}</option>
            <option value="work">{lang==="zh"?"工作":"Work"}</option>
            <option value="personal">{lang==="zh"?"个人":"Personal"}</option>
          </select>
        </SettingRow>
        <SettingRow label={lang==="zh"?"默认清单":"Default List"}>
          <select className="sl-select" value={defaultList} onChange={e=>setDefaultList(e.target.value)}>
            <option value="inbox">{lang==="zh"?"收件箱":"Inbox"}</option>
            <option value="today">{lang==="zh"?"今天":"Today"}</option>
          </select>
        </SettingRow>
      </SectionBlock>

      <SectionBlock style={{marginTop:14}}>
        <SettingRow label={lang==="zh"?"默认添加到":"Default Add to"}>
          <select className="sl-select" value={addTo} onChange={e=>setAddTo(e.target.value)}>
            <option value="top">{lang==="zh"?"列表顶部":"Top of List"}</option>
            <option value="bottom">{lang==="zh"?"列表底部":"Bottom of List"}</option>
          </select>
        </SettingRow>
        <SettingRow label={lang==="zh"?"过期区显示位置":"Overdue Section shows at"}>
          <select className="sl-select" value={overdueAt} onChange={e=>setOverdueAt(e.target.value)}>
            <option value="top">{lang==="zh"?"列表顶部":"Top of List"}</option>
            <option value="bottom">{lang==="zh"?"列表底部":"Bottom of List"}</option>
          </select>
        </SettingRow>
      </SectionBlock>

      <div className="reset-link">{lang==="zh"?"恢复默认":"Reset Default"}</div>

      <h4 className="pane-h-block">{lang==="zh"?"任务模板":"Task Template"} <Icon name="chevD" size={12}/></h4>
      <div className="template-grid">
        {TEMPLATES.map((t,i) => (
          <div key={i} className="template-card">
            <h5>{t.name}</h5>
            <ul>
              {t.items.map((it,j) => (
                <li key={j}><span className="cbx"/><span>{it}</span></li>
              ))}
            </ul>
          </div>
        ))}
      </div>
    </div>
  );
}

/* ============================================================
   INTEGRATIONS & IMPORT
   ============================================================ */
function IntegrationsPane({ lang }){
  const { s } = window.useI18n(lang);
  const FEATURED = [
    { id:"wechat",  name:"WeChat",          color:"#07c160", short:"W" },
    { id:"gcal",    name:"Google Calendar", color:"#4285f4", short:"G" },
    { id:"notion",  name:"Notion",          color:"#000",    short:"N" },
  ];
  const CALENDAR = [
    { id:"local",    name:lang==="zh"?"本地日历":"Local Calendars",   color:"oklch(60% 0.16 25)",  short:"L" },
    { id:"gcal",     name:"Google Calendar",                          color:"#4285f4", short:"G" },
    { id:"outlook",  name:"Outlook Calendar",                         color:"#0078d4", short:"O" },
    { id:"exchange", name:"Exchange Calendar",                        color:"#0072c6", short:"E" },
    { id:"icloud",   name:"iCloud Calendar",                          color:"#42a5f5", short:"" , icon:"cloud"},
    { id:"wecom",    name:"WeCom Calendar",                           color:"#1aad19", short:"W" },
    { id:"dingtalk", name:"DingTalk Calendar",                        color:"#1296db", short:"D" },
    { id:"feishu",   name:"Feishu Calendar",                          color:"#3370ff", short:"F" },
    { id:"caldav",   name:"CalDAV",                                   color:"oklch(70% 0.14 60)", short:"C" },
    { id:"url",      name:"URL",                                      color:"oklch(60% 0.16 245)", short:"U" },
  ];
  const INTEGRATE = [
    { id:"slack",     name:"Slack",         color:"#4a154b", short:"S" },
    { id:"linear",    name:"Linear",        color:"#5e6ad2", short:"L" },
    { id:"gh",        name:"GitHub",        color:"#1a1a1a", short:"G" },
    { id:"todoist",   name:"Todoist (Import)", color:"#e44332", short:"T" },
  ];

  return (
    <div className="int-pane">
      <h4 className="int-h">{lang==="zh"?"精选":"Featured"}</h4>
      <div className="int-grid">{FEATURED.map(it => <IntegrationCard key={it.id} {...it}/>)}</div>
      <h4 className="int-h">{lang==="zh"?"日历":"Calendar"}</h4>
      <div className="int-grid">{CALENDAR.map(it => <IntegrationCard key={it.id} {...it}/>)}</div>
      <h4 className="int-h">{lang==="zh"?"集成":"Integrate"}</h4>
      <div className="int-grid">{INTEGRATE.map(it => <IntegrationCard key={it.id} {...it}/>)}</div>
    </div>
  );
}
function IntegrationCard({ name, color, short, icon }){
  return (
    <button className="int-card">
      <span className="int-logo" style={{background:color}}>
        {icon ? <Icon name={icon} size={16} color="#fff"/> : short}
      </span>
      <span className="int-name">{name}</span>
    </button>
  );
}

/* ============================================================
   COLLABORATE
   ============================================================ */
function CollaboratePane({ lang }){
  return (
    <div className="collab-pane">
      <h3 className="pane-title">{lang==="zh"?"协作":"Collaborate"}</h3>
      <SectionBlock>
        <SettingRow label={lang==="zh"?"显示协作者头像":"Show collaborator avatars"}>
          <Toggle on={true} onChange={()=>{}}/>
        </SettingRow>
        <SettingRow label={lang==="zh"?"分享时默认权限":"Default share permission"}>
          <select className="sl-select"><option>{lang==="zh"?"可评论":"Can comment"}</option><option>{lang==="zh"?"可编辑":"Can edit"}</option><option>{lang==="zh"?"只读":"View only"}</option></select>
        </SettingRow>
        <SettingRow label={lang==="zh"?"接收 @ 提及通知":"Notify on @ mentions"}>
          <Toggle on={true} onChange={()=>{}}/>
        </SettingRow>
      </SectionBlock>
    </div>
  );
}

/* ============================================================
   STICKY NOTE
   ============================================================ */
function StickyNotePane({ lang }){
  const { s } = window.useI18n(lang);
  const COLORS = [
    "#fdee87","#fcd6c8","#f5a3a3","#cfe7f5","#bbcef8","#d6c2f5",
    "#cfeed6","#ffffff","#e8e8e8","#414141","#1c2335","#0e1730","random",
  ];
  const [color,setColor] = usePref("sn_color", "#fdee87");
  const [font,setFont]   = usePref("sn_font", "large");
  const [pin,setPin]     = usePref("sn_pin", true);
  const [restore,setRestore] = usePref("sn_restore", false);
  const [spacing,setSpacing] = usePref("sn_spacing", "normal");

  return (
    <div className="sticky-pane">
      <h3 className="pane-title">{s("settings.sticky")}</h3>
      <p className="pane-sub">{lang==="zh"
        ? "将任务以便签形式钉在桌面快速捕获想法。（右键任务，选择「打开为便签」）"
        : 'Pin tasks as Sticky Notes on your desktop for quick idea capture. (Right-click tasks and choose "Open as Sticky Note")'} <a className="link">{lang==="zh"?"了解更多":"Learn more"}</a></p>

      <h4 className="sl-group">{lang==="zh"?"默认颜色":"Default Color"}</h4>
      <div className="sn-colors">
        {COLORS.map((c, i) => (
          <button key={i}
            className={"sn-sw" + (color===c?" active":"")}
            style={{ background: c==="random" ? "conic-gradient(from 0deg, #f5a3a3, #fdee87, #cfeed6, #bbcef8, #d6c2f5, #f5a3a3)" : c }}
            onClick={()=>setColor(c)}>
            <span className="sn-crown"><Icon name="star" size={9}/></span>
            {color===c && <Icon name="check2" size={11} color="#fff" style={{background:"var(--accent)",borderRadius:999, padding:2}}/>}
            {c==="random" && <Icon name="sync" size={12} color="#fff"/>}
          </button>
        ))}
      </div>

      <SettingRow label={lang==="zh"?"字体大小":"Font Size"}>
        <select className="sl-select" value={font} onChange={e=>setFont(e.target.value)}>
          <option value="small">{lang==="zh"?"小":"Small"}</option>
          <option value="normal">{lang==="zh"?"普通":"Normal"}</option>
          <option value="large">{lang==="zh"?"大":"Large"}</option>
          <option value="xl">{lang==="zh"?"特大":"Extra-Large"}</option>
        </select>
      </SettingRow>

      <SectionBlock style={{marginTop:14}}>
        <SettingRow label={lang==="zh"?"默认置顶":"Pin by Default"}>
          <Toggle on={pin} onChange={()=>setPin(!pin)}/>
        </SettingRow>
        <SettingRow label={lang==="zh"?"恢复默认尺寸":"Restore Default Size"}
          desc={lang==="zh"?"启用后排列便签时会恢复至默认尺寸。":"If enabled, sticky notes will restore to their default size when arranging."}>
          <Toggle on={restore} onChange={()=>setRestore(!restore)}/>
        </SettingRow>
      </SectionBlock>

      <h4 className="sl-group">{lang==="zh"?"默认网格间距":"Default Grid Spacing"}</h4>
      <div className="sn-spacing">
        {[
          { id:"none",   gap:"0" },
          { id:"normal", gap:"6px" },
          { id:"large",  gap:"14px" },
          { id:"xl",     gap:"24px" },
        ].map(opt => (
          <button key={opt.id}
            className={"sn-sp" + (spacing===opt.id?" active":"")}
            onClick={()=>setSpacing(opt.id)}>
            <div className="sn-sp-row" style={{ gap: opt.gap }}>
              <span className="sn-sp-tile"/><span className="sn-sp-tile"/>
            </div>
            <div className="sn-sp-label">
              {spacing===opt.id && <Icon name="check2" size={10} color="#fff" style={{background:"var(--accent)",borderRadius:999, padding:2, marginRight:4}}/>}
              {lang==="zh"
                ? { none:"无", normal:"普通", large:"大", xl:"特大" }[opt.id]
                : { none:"None", normal:"Normal", large:"Large", xl:"Extra-Large" }[opt.id]}
            </div>
          </button>
        ))}
      </div>
    </div>
  );
}

/* ============================================================
   HOTKEYS
   ============================================================ */
function HotkeysPane({ lang }){
  const { s } = window.useI18n(lang);
  const KEYS = [
    { action: lang==="zh"?"快速添加":"Quick add",          combo:"⌘ ⇧ A" },
    { action: lang==="zh"?"全局搜索":"Global search",       combo:"⌘ K"   },
    { action: lang==="zh"?"切换看板":"Switch boards",       combo:"⌘ B"   },
    { action: lang==="zh"?"今日任务":"Today",               combo:"⌘ T"   },
    { action: lang==="zh"?"日历":"Calendar",                combo:"⌘ C"   },
    { action: lang==="zh"?"番茄钟":"Pomodoro",              combo:"⌘ P"   },
    { action: lang==="zh"?"切换深色":"Toggle dark mode",    combo:"⌘ ⇧ D" },
    { action: lang==="zh"?"切换桌宠":"Toggle pet",          combo:"⌘ ⇧ P" },
    { action: lang==="zh"?"创建便签":"New sticky note",     combo:"⌘ ⇧ N" },
    { action: lang==="zh"?"清除完成任务":"Clear completed", combo:"⌘ ⇧ K" },
  ];
  return (
    <div className="hotkeys-pane">
      <h3 className="pane-title">{s("settings.hotkeys")}</h3>
      <ul className="hk-list">
        {KEYS.map((k,i) => (
          <li key={i} className="hk-row">
            <span>{k.action}</span>
            <span className="grow"></span>
            <span className="hk-combo">{k.combo.split(" ").map((c,j) => <kbd key={j}>{c}</kbd>)}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}

/* ============================================================
   ABOUT
   ============================================================ */
function AboutPane({ lang }){
  return (
    <div className="about-pane">
      <div className="about-logo">
        <div className="about-mark">XAI</div>
      </div>
      <h3>{lang==="zh"?"XAI 工作台":"XAI Console"}</h3>
      <div className="about-ver mono">v 1.2.0 · build 2026.05.23</div>
      <p className="about-desc">{lang==="zh"
        ? "一款轻盈、专注、面向中英双语用户的生产力工作台。"
        : "A focused, bilingual productivity workspace."}</p>
      <div className="about-links">
        <a className="link">{lang==="zh"?"更新日志":"Changelog"}</a>
        <a className="link">{lang==="zh"?"隐私政策":"Privacy"}</a>
        <a className="link">{lang==="zh"?"服务条款":"Terms"}</a>
        <a className="link">{lang==="zh"?"反馈":"Feedback"}</a>
      </div>
    </div>
  );
}

/* ============================================================
   Reusable bits
   ============================================================ */
function SettingRow({ label, desc, children, style }){
  return (
    <div className="setting-row" style={style}>
      <div className="sr-text">
        <div className="sr-label">{label}</div>
        {desc && <div className="sr-desc">{desc}</div>}
      </div>
      <div className="sr-ctrl">{children}</div>
    </div>
  );
}
function SectionBlock({ children, style }){
  return <div className="setting-block" style={style}>{children}</div>;
}
function Toggle({ on, onChange }){
  return (
    <button className={"toggle" + (on?" on":"")} onClick={onChange} role="switch" aria-checked={on}>
      <span className="toggle-knob"/>
    </button>
  );
}

window.SettingsModule = SettingsModule;
