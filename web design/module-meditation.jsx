/* ============================================================
   Meditation — pick scene/clock/sound, enter fullscreen player
   ============================================================ */
const Icon = window.Icon;
const MOCK = window.MOCK;

function MeditationModule({ lang }){
  const { s } = window.useI18n(lang);
  const [scene, setScene]   = useState("ocean");
  const [clock, setClock]   = useState("split");
  const [sound, setSound]   = useState("water");
  const [duration, setDuration] = useState(15);
  const [active, setActive] = useState(false);

  const sceneObj = MOCK.meditationScenes.find(x => x.id === scene);

  return (
    <div className="module module-meditation">
      <header className="module-head">
        <h1 className="module-title"><Icon name="leaf" size={18}/> {s("meditation.title")}</h1>
        <span className="grow"></span>
        <button className="icon-btn"><Icon name="dots" size={16}/></button>
      </header>

      <div className="med-layout">
        {/* Preview card */}
        <div className="med-preview" style={{background: sceneObj.grad}}>
          <div className="med-preview-overlay"/>
          <ClockDisplay variant={clock} accent={sceneObj.accent} mini/>
          <div className="med-preview-foot">
            <div className="mp-meta">
              <span><Icon name="leaf" size={12}/> {s(`meditation.scenes.${scene}`)}</span>
              <span><Icon name="clock" size={12}/> {s(`meditation.clocks.${clock}`)}</span>
              <span><Icon name="sound" size={12}/> {s(`meditation.sounds.${sound}`)}</span>
              <span><Icon name="timer" size={12}/> {duration} {s("meditation.mins")}</span>
            </div>
            <button className="btn primary med-start" onClick={()=>setActive(true)}>
              <Icon name="play" size={14}/> {s("meditation.start")}
            </button>
          </div>
        </div>

        {/* Picker columns */}
        <div className="med-pickers">
          <PickerGroup title={s("meditation.pick_scene")}>
            <div className="scene-grid">
              {MOCK.meditationScenes.map(sc => (
                <button key={sc.id}
                  className={"scene-card" + (scene===sc.id?" active":"")}
                  style={{background: sc.grad}}
                  onClick={()=>setScene(sc.id)}>
                  <span className="scene-label">{s(`meditation.scenes.${sc.id}`)}</span>
                </button>
              ))}
            </div>
          </PickerGroup>

          <PickerGroup title={s("meditation.pick_clock")}>
            <div className="clock-grid">
              {["digital","split","analog","minimal"].map(c => (
                <button key={c}
                  className={"clock-card" + (clock===c?" active":"")}
                  onClick={()=>setClock(c)}>
                  <div className="cc-preview"><ClockDisplay variant={c} accent="var(--text-1)" mini static/></div>
                  <div className="cc-label">{s(`meditation.clocks.${c}`)}</div>
                </button>
              ))}
            </div>
          </PickerGroup>

          <PickerGroup title={s("meditation.pick_sound")}>
            <div className="sound-grid">
              {["none","water","rain","waves","forest"].map(sd => (
                <button key={sd}
                  className={"sound-card" + (sound===sd?" active":"")}
                  onClick={()=>setSound(sd)}>
                  <Icon name={sd==="rain" ? "rain" : sd==="none" ? "soundOff" : "sound"} size={16}/>
                  <span>{s(`meditation.sounds.${sd}`)}</span>
                </button>
              ))}
            </div>
          </PickerGroup>

          <PickerGroup title={s("meditation.duration")}>
            <div className="dur-row">
              {[5, 10, 15, 25, 45].map(d => (
                <button key={d}
                  className={"dur-chip" + (duration===d?" active":"")}
                  onClick={()=>setDuration(d)}>
                  {d}<span className="dur-unit">{s("meditation.mins")}</span>
                </button>
              ))}
            </div>
          </PickerGroup>
        </div>
      </div>

      {active && (
        <MeditationPlayer
          scene={sceneObj}
          clock={clock}
          sound={sound}
          duration={duration}
          lang={lang}
          onExit={()=>setActive(false)}/>
      )}
    </div>
  );
}

function PickerGroup({ title, children }){
  return (
    <div className="picker-group">
      <h3 className="picker-h">{title}</h3>
      {children}
    </div>
  );
}

/* ---------- Clock display (used in preview and player) ---------- */
function ClockDisplay({ variant = "digital", accent = "#fff", mini = false, static: isStatic = false }){
  const [now, setNow] = useState(new Date());
  useEffect(() => {
    if (isStatic) return;
    const id = setInterval(()=>setNow(new Date()), 1000);
    return ()=>clearInterval(id);
  }, [isStatic]);

  const t = isStatic ? new Date(2024,0,1,3,44,17) : now;
  const hh = String(t.getHours()).padStart(2,'0');
  const mm = String(t.getMinutes()).padStart(2,'0');
  const ss = String(t.getSeconds()).padStart(2,'0');

  if (variant === "split") {
    return (
      <div className={"clk-split mono" + (mini?" mini":"")} style={{color: accent}}>
        <span>{hh}</span>
        <span className="clk-colon">:</span>
        <span>{mm}</span>
        <span className="clk-colon dim">:</span>
        <span className="dim">{ss}</span>
      </div>
    );
  }
  if (variant === "digital") {
    return (
      <div className={"clk-digital mono" + (mini?" mini":"")} style={{color: accent}}>
        {hh}:{mm}<span className="dim">:{ss}</span>
      </div>
    );
  }
  if (variant === "minimal") {
    return (
      <div className={"clk-minimal mono" + (mini?" mini":"")} style={{color: accent}}>
        {hh}<span className="dim">{mm}</span>
      </div>
    );
  }
  if (variant === "analog") {
    const hAng = ((t.getHours()%12) + t.getMinutes()/60) * 30;
    const mAng = (t.getMinutes() + t.getSeconds()/60) * 6;
    const sAng = t.getSeconds() * 6;
    const size = mini ? 88 : 280;
    return (
      <svg viewBox="0 0 100 100" width={size} height={size} className="clk-analog">
        <circle cx="50" cy="50" r="46" fill="none" stroke={accent} strokeOpacity=".35" strokeWidth="1"/>
        {Array.from({length:12}).map((_,i) => {
          const a = i * 30 * Math.PI/180;
          const x1 = 50 + Math.sin(a)*42, y1 = 50 - Math.cos(a)*42;
          const x2 = 50 + Math.sin(a)*46, y2 = 50 - Math.cos(a)*46;
          return <line key={i} x1={x1} y1={y1} x2={x2} y2={y2} stroke={accent} strokeOpacity=".55" strokeWidth="1"/>;
        })}
        <line x1="50" y1="50" x2="50" y2="22" stroke={accent} strokeWidth="2.4" strokeLinecap="round" transform={`rotate(${hAng} 50 50)`}/>
        <line x1="50" y1="50" x2="50" y2="14" stroke={accent} strokeWidth="1.6" strokeLinecap="round" transform={`rotate(${mAng} 50 50)`}/>
        <line x1="50" y1="50" x2="50" y2="10" stroke="oklch(70% 0.18 25)" strokeWidth="0.8" strokeLinecap="round" transform={`rotate(${sAng} 50 50)`}/>
        <circle cx="50" cy="50" r="1.5" fill={accent}/>
      </svg>
    );
  }
  return null;
}

/* ---------- Fullscreen Player ---------- */
function MeditationPlayer({ scene, clock, sound, duration, lang, onExit }){
  const { s } = window.useI18n(lang);
  const [elapsed, setElapsed] = useState(0);
  useEffect(() => {
    const id = setInterval(()=>setElapsed(e => e+1), 1000);
    return ()=>clearInterval(id);
  }, []);
  const total = duration * 60;
  const remaining = Math.max(0, total - elapsed);
  const mm = String(Math.floor(remaining/60)).padStart(2,'0');
  const ss = String(remaining%60).padStart(2,'0');
  const progress = elapsed / total;

  // breathing animation cycle 8s
  return (
    <div className="med-player" style={{background: scene.grad}}>
      <div className="med-player-bg"/>
      {/* ambient particles */}
      <div className="med-particles">
        {Array.from({length: 18}).map((_,i)=>(
          <div key={i} className="particle" style={{
            left: `${(i*53)%100}%`,
            animationDelay: `${i*0.6}s`,
            animationDuration: `${10 + (i%4)*3}s`,
            background: scene.accent,
          }}/>
        ))}
      </div>

      <div className="med-player-clock">
        <ClockDisplay variant={clock} accent={scene.accent}/>
      </div>

      <div className="med-breathe">
        <div className="breathe-ring" style={{borderColor: scene.accent}}/>
        <div className="breathe-label" style={{color: scene.accent}}>{s("meditation.breathe")}</div>
      </div>

      <div className="med-player-footer">
        <div className="mp-progress">
          <div className="mp-progress-bar" style={{width: (progress*100)+"%", background: scene.accent}}/>
        </div>
        <div className="mp-foot-row">
          <span className="mp-remaining mono" style={{color: scene.accent}}>{mm}:{ss}</span>
          <span className="grow"></span>
          <span className="mp-info">
            <Icon name="sound" size={13}/> {s(`meditation.sounds.${sound}`)}
          </span>
        </div>
      </div>

      <button className="med-exit" onClick={onExit} aria-label={s("meditation.exit")}>
        <Icon name="close" size={18}/>
      </button>
    </div>
  );
}

window.MeditationModule = MeditationModule;
