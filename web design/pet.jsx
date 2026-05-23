/* ============================================================
   Desktop Pet — 8 original characters, each with own animation
   ============================================================ */
const Icon = window.Icon;

/* ---------- Pet renders (original SVG, no copied IP) ---------- */
const PetArt = {
  mochi: (mood) => (
    <svg viewBox="0 0 100 100" width="84" height="84">
      <defs>
        <radialGradient id="p-mochi" cx=".4" cy=".35" r=".7">
          <stop offset="0" stopColor="oklch(85% 0.10 165)"/><stop offset="1" stopColor="oklch(60% 0.10 165)"/>
        </radialGradient>
        <radialGradient id="p-mochi-belly" cx=".5" cy=".7" r=".4">
          <stop offset="0" stopColor="oklch(96% 0.04 165)"/><stop offset="1" stopColor="oklch(88% 0.07 165)"/>
        </radialGradient>
      </defs>
      <path d="M28 30 Q22 14 36 18 Q40 24 36 32 Z" fill="oklch(58% 0.13 145)" opacity=".9"/>
      <path d="M72 30 Q78 14 64 18 Q60 24 64 32 Z" fill="oklch(58% 0.13 145)" opacity=".9"/>
      <ellipse cx="50" cy="58" rx="34" ry="32" fill="url(#p-mochi)"/>
      <ellipse cx="50" cy="66" rx="22" ry="20" fill="url(#p-mochi-belly)"/>
      <Eyes mood={mood} cx1={42} cy1={52} cx2={58} cy2={52}/>
      <circle cx="36" cy="60" r="3" fill="oklch(80% 0.10 25)" opacity=".5"/>
      <circle cx="64" cy="60" r="3" fill="oklch(80% 0.10 25)" opacity=".5"/>
      <Mouth mood={mood} cx={50} cy={62}/>
    </svg>
  ),
  pip: (mood) => (
    <svg viewBox="0 0 100 100" width="84" height="84">
      <defs>
        <radialGradient id="p-pip" cx=".4" cy=".35" r=".7">
          <stop offset="0" stopColor="oklch(94% 0.13 95)"/><stop offset="1" stopColor="oklch(78% 0.16 80)"/>
        </radialGradient>
      </defs>
      {/* tuft */}
      <path d="M48 24 L46 16 L50 20 L54 16 L52 24 Z" fill="oklch(60% 0.16 60)"/>
      {/* body */}
      <ellipse cx="50" cy="58" rx="30" ry="30" fill="url(#p-pip)"/>
      {/* wing */}
      <path d="M28 52 Q32 70 44 70 Q40 60 30 56 Z" fill="oklch(72% 0.15 70)" opacity=".85"/>
      {/* beak */}
      <path d="M50 56 L60 60 L50 64 Z" fill="oklch(65% 0.16 50)"/>
      <Eyes mood={mood} cx1={42} cy1={52} cx2={50} cy2={52}/>
      {/* feet */}
      <path d="M44 84 L42 90 M44 84 L46 90 M44 84 L40 90" stroke="oklch(50% 0.13 40)" strokeWidth="2" strokeLinecap="round" fill="none"/>
      <path d="M56 84 L54 90 M56 84 L58 90 M56 84 L52 90" stroke="oklch(50% 0.13 40)" strokeWidth="2" strokeLinecap="round" fill="none"/>
    </svg>
  ),
  sprout: (mood) => (
    <svg viewBox="0 0 100 100" width="84" height="84">
      <defs>
        <radialGradient id="p-pot" cx=".5" cy=".4" r=".6">
          <stop offset="0" stopColor="oklch(72% 0.06 50)"/><stop offset="1" stopColor="oklch(52% 0.08 40)"/>
        </radialGradient>
      </defs>
      {/* pot */}
      <path d="M28 60 H72 L66 92 H34 Z" fill="url(#p-pot)"/>
      <rect x="26" y="56" width="48" height="8" rx="2" fill="oklch(62% 0.08 40)"/>
      {/* leaves */}
      <path d="M50 60 Q34 40 30 26 Q44 28 50 50 Z" fill="oklch(60% 0.14 145)"/>
      <path d="M50 60 Q66 40 70 26 Q56 28 50 50 Z" fill="oklch(68% 0.14 140)"/>
      <path d="M50 60 L50 28" stroke="oklch(50% 0.10 145)" strokeWidth="2" strokeLinecap="round"/>
      {/* face on pot */}
      <Eyes mood={mood} cx1={42} cy1={76} cx2={58} cy2={76} small/>
      <Mouth mood={mood} cx={50} cy={82}/>
    </svg>
  ),
  lumi: (mood) => (
    <svg viewBox="0 0 100 100" width="84" height="84">
      <defs>
        <radialGradient id="p-lumi" cx=".4" cy=".3" r=".7">
          <stop offset="0" stopColor="#fffbe6"/><stop offset="1" stopColor="oklch(85% 0.12 80)"/>
        </radialGradient>
      </defs>
      {/* glow halo */}
      <circle cx="50" cy="44" r="38" fill="oklch(90% 0.14 85)" opacity=".18"/>
      {/* bulb */}
      <path d="M30 44 Q30 16 50 16 Q70 16 70 44 Q70 58 60 64 L40 64 Q30 58 30 44 Z" fill="url(#p-lumi)"/>
      {/* filament */}
      <path d="M42 40 Q46 46 42 52 M58 40 Q54 46 58 52" stroke="oklch(60% 0.16 65)" strokeWidth="1.4" fill="none" strokeLinecap="round"/>
      {/* screw base */}
      <rect x="36" y="66" width="28" height="4" rx="1" fill="oklch(58% 0.02 80)"/>
      <rect x="36" y="72" width="28" height="4" rx="1" fill="oklch(50% 0.02 80)"/>
      <rect x="36" y="78" width="28" height="4" rx="1" fill="oklch(42% 0.02 80)"/>
      <path d="M44 86 H56 L52 92 H48 Z" fill="oklch(35% 0.02 80)"/>
      <Eyes mood={mood} cx1={43} cy1={42} cx2={57} cy2={42}/>
      <Mouth mood={mood} cx={50} cy={52}/>
    </svg>
  ),
  drip: (mood) => (
    <svg viewBox="0 0 100 100" width="84" height="84">
      <defs>
        <radialGradient id="p-drip" cx=".4" cy=".4" r=".7">
          <stop offset="0" stopColor="oklch(94% 0.06 230)"/><stop offset="1" stopColor="oklch(65% 0.14 235)"/>
        </radialGradient>
      </defs>
      <path d="M50 14 C 64 36 80 50 80 64 C 80 78 66 88 50 88 C 34 88 20 78 20 64 C 20 50 36 36 50 14 Z" fill="url(#p-drip)"/>
      <path d="M40 32 C 36 38 32 46 32 52" stroke="#fff" strokeWidth="3" strokeLinecap="round" opacity=".4" fill="none"/>
      <Eyes mood={mood} cx1={42} cy1={58} cx2={58} cy2={58}/>
      <circle cx="36" cy="68" r="3" fill="oklch(80% 0.10 25)" opacity=".4"/>
      <circle cx="64" cy="68" r="3" fill="oklch(80% 0.10 25)" opacity=".4"/>
      <Mouth mood={mood} cx={50} cy={68}/>
    </svg>
  ),
  pebble: (mood) => (
    <svg viewBox="0 0 100 100" width="84" height="84">
      <defs>
        <radialGradient id="p-peb" cx=".4" cy=".3" r=".7">
          <stop offset="0" stopColor="oklch(72% 0.02 60)"/><stop offset="1" stopColor="oklch(48% 0.02 60)"/>
        </radialGradient>
      </defs>
      <path d="M16 60 Q14 30 42 22 Q70 14 82 38 Q92 60 78 76 Q60 88 38 82 Q18 78 16 60 Z" fill="url(#p-peb)"/>
      <ellipse cx="40" cy="38" rx="6" ry="3" fill="#fff" opacity=".25"/>
      <Eyes mood={mood} cx1={42} cy1={56} cx2={58} cy2={56}/>
      <Mouth mood={mood} cx={50} cy={66}/>
    </svg>
  ),
  star: (mood) => (
    <svg viewBox="0 0 100 100" width="84" height="84">
      <defs>
        <radialGradient id="p-star" cx=".5" cy=".4" r=".6">
          <stop offset="0" stopColor="#fffbe6"/><stop offset="1" stopColor="oklch(78% 0.16 85)"/>
        </radialGradient>
      </defs>
      <circle cx="50" cy="50" r="42" fill="oklch(85% 0.16 80)" opacity=".15"/>
      <path d="M50 12 L60 40 L90 44 L66 62 L74 90 L50 74 L26 90 L34 62 L10 44 L40 40 Z" fill="url(#p-star)" stroke="oklch(60% 0.16 60)" strokeWidth="1.5"/>
      <Eyes mood={mood} cx1={43} cy1={52} cx2={57} cy2={52}/>
      <circle cx="38" cy="60" r="2.5" fill="oklch(75% 0.14 30)" opacity=".5"/>
      <circle cx="62" cy="60" r="2.5" fill="oklch(75% 0.14 30)" opacity=".5"/>
      <Mouth mood={mood} cx={50} cy={62}/>
    </svg>
  ),
  ember: (mood) => (
    <svg viewBox="0 0 100 100" width="84" height="84">
      <defs>
        <radialGradient id="p-em" cx=".5" cy=".55" r=".55">
          <stop offset="0" stopColor="oklch(94% 0.16 80)"/>
          <stop offset=".5" stopColor="oklch(72% 0.18 50)"/>
          <stop offset="1" stopColor="oklch(50% 0.18 30)"/>
        </radialGradient>
      </defs>
      <circle cx="50" cy="56" r="38" fill="oklch(70% 0.18 50)" opacity=".15"/>
      <path d="M50 12 C 62 26 70 36 72 50 C 74 70 64 86 50 88 C 36 86 26 70 28 50 C 30 36 38 26 50 12 Z" fill="url(#p-em)"/>
      <path d="M50 36 C 56 44 60 52 56 64 C 52 70 44 70 42 64 C 40 56 46 46 50 36 Z" fill="oklch(94% 0.14 80)" opacity=".8"/>
      <Eyes mood={mood} cx1={44} cy1={58} cx2={56} cy2={58}/>
      <Mouth mood={mood} cx={50} cy={68}/>
    </svg>
  ),
};

function Eyes({ mood, cx1, cy1, cx2, cy2, small }){
  const r = small ? 1.6 : 2.4;
  if (mood === "happy") return (
    <g stroke="#222" strokeWidth={small?1.8:2.4} strokeLinecap="round" fill="none">
      <path d={`M${cx1-4} ${cy1+2} Q${cx1} ${cy1-2} ${cx1+4} ${cy1+2}`}/>
      <path d={`M${cx2-4} ${cy2+2} Q${cx2} ${cy2-2} ${cx2+4} ${cy2+2}`}/>
    </g>
  );
  if (mood === "sleep") return (
    <g stroke="#222" strokeWidth={small?1.6:2.4} strokeLinecap="round">
      <line x1={cx1-3} y1={cy1+1} x2={cx1+3} y2={cy1+1}/>
      <line x1={cx2-3} y1={cy2+1} x2={cx2+3} y2={cy2+1}/>
    </g>
  );
  return (
    <g fill="#222">
      <ellipse cx={cx1} cy={cy1} rx={r} ry={r*1.3}/>
      <ellipse cx={cx2} cy={cy2} rx={r} ry={r*1.3}/>
      <circle cx={cx1+0.7} cy={cy1-0.7} r={r*0.32} fill="#fff"/>
      <circle cx={cx2+0.7} cy={cy2-0.7} r={r*0.32} fill="#fff"/>
    </g>
  );
}
function Mouth({ mood, cx, cy }){
  if (mood === "happy") return <path d={`M${cx-6} ${cy} Q${cx} ${cy+6} ${cx+6} ${cy}`} fill="none" stroke="#222" strokeWidth="2" strokeLinecap="round"/>;
  return <path d={`M${cx-4} ${cy} Q${cx} ${cy+2} ${cx+4} ${cy}`} fill="none" stroke="#222" strokeWidth="1.8" strokeLinecap="round"/>;
}

/* ---------- Pet catalog ---------- */
const PET_DEFS = [
  { id:"mochi",  anim:"bob",     name:{en:"Mochi",  zh:"麻薯"},  desc:{en:"A squishy mint companion.",            zh:"绵软的薄荷小球。"} },
  { id:"pip",    anim:"hop",     name:{en:"Pip",    zh:"啾啾"},  desc:{en:"A tiny bird with big ideas.",          zh:"满脑子点子的小鸟。"} },
  { id:"sprout", anim:"sway",    name:{en:"Sprout", zh:"豆芽"},  desc:{en:"A baby plant cheering you on.",        zh:"为你加油的小苗。"} },
  { id:"lumi",   anim:"glow",    name:{en:"Lumi",   zh:"小灯"},  desc:{en:"A bulb that lights up your ideas.",    zh:"照亮灵感的小灯泡。"} },
  { id:"drip",   anim:"bob",     name:{en:"Drip",   zh:"水滴"},  desc:{en:"A tiny water spirit. Stay hydrated.",  zh:"提醒你喝水的小水滴。"} },
  { id:"pebble", anim:"still",   name:{en:"Pebble", zh:"小石"},  desc:{en:"A steady rock for deep-focus days.",   zh:"专注日里的稳重伙伴。"} },
  { id:"star",   anim:"twinkle", name:{en:"Twink",  zh:"小星"},  desc:{en:"A star that twinkles on every win.",   zh:"为每个成就闪烁的星星。"} },
  { id:"ember",  anim:"flicker", name:{en:"Ember",  zh:"小火"},  desc:{en:"A warm flame for late-night focus.",   zh:"陪你深夜冲刺的小火苗。"} },
];

function DesktopPet({ lang, on }){
  const { s } = window.useI18n(lang);

  /* ----- persisted position ----- */
  const [pos, setPos] = useState(() => {
    try {
      const saved = localStorage.getItem("xai_pet_pos");
      if (saved) return JSON.parse(saved);
    } catch(e){}
    return { x: window.innerWidth - 140, y: window.innerHeight - 200 };
  });
  useEffect(() => {
    try { localStorage.setItem("xai_pet_pos", JSON.stringify(pos)); } catch(e){}
  }, [pos]);

  /* ----- persisted pet character ----- */
  const [petId, setPetId] = useState(() => {
    try { return localStorage.getItem("xai_pet_id") || "mochi"; } catch(e){ return "mochi"; }
  });
  useEffect(() => {
    try { localStorage.setItem("xai_pet_id", petId); } catch(e){}
  }, [petId]);

  const [drag, setDrag]     = useState(null);
  const [bubble, setBubble] = useState(null);
  const [mood, setMood]     = useState("idle");
  const [pickerOpen, setPickerOpen] = useState(false);

  /* auto rotate tips */
  useEffect(() => {
    if (!on || pickerOpen) return;
    const tips = [s("pet.hello"), s("pet.tip1"), s("pet.tip2"), s("pet.tip3"), s("pet.tip4")];
    let i = 0;
    setBubble(tips[i]);
    const dismiss = setTimeout(()=>setBubble(null), 5500);
    const cycle = setInterval(() => {
      i = (i+1) % tips.length;
      setBubble(null);
      setTimeout(()=>setBubble(tips[i]), 400);
    }, 12000);
    return () => { clearInterval(cycle); clearTimeout(dismiss); };
  }, [on, lang, pickerOpen]);

  /* drag */
  const onPointerDown = (e) => {
    setDrag({ ox: e.clientX - pos.x, oy: e.clientY - pos.y, moved: false });
    setBubble(null);
  };
  const onPointerMove = (e) => {
    if (!drag) return;
    const nx = Math.max(8, Math.min(window.innerWidth - 96, e.clientX - drag.ox));
    const ny = Math.max(8, Math.min(window.innerHeight - 96, e.clientY - drag.oy));
    setPos({ x: nx, y: ny });
    if (Math.abs(e.movementX) + Math.abs(e.movementY) > 1) setDrag(d => ({...d, moved:true}));
  };
  const onPointerUp = () => {
    if (drag && !drag.moved) {
      const tips = [s("pet.tip1"), s("pet.tip2"), s("pet.tip3"), s("pet.tip4"), s("pet.working")];
      setBubble(tips[Math.floor(Math.random()*tips.length)]);
      setMood("happy");
      setTimeout(()=>setMood("idle"), 1600);
    }
    setDrag(null);
  };
  useEffect(() => {
    if (!drag) return;
    window.addEventListener("pointermove", onPointerMove);
    window.addEventListener("pointerup", onPointerUp);
    return () => {
      window.removeEventListener("pointermove", onPointerMove);
      window.removeEventListener("pointerup", onPointerUp);
    };
  }, [drag]);

  if (!on) return (
    <PetPicker open={pickerOpen} onClose={()=>setPickerOpen(false)} current={petId} onSelect={setPetId} lang={lang}/>
  );

  const def = PET_DEFS.find(p => p.id === petId) || PET_DEFS[0];
  const bubbleSide = pos.x > window.innerWidth - 280 ? "left" : "right";

  return (
    <>
      <div className="pet-wrap"
        style={{ transform: `translate(${pos.x}px, ${pos.y}px)`, cursor: drag ? "grabbing" : "grab" }}>
        {bubble && (
          <div className={"pet-bubble pet-bubble-" + bubbleSide}>
            <div className="pet-bubble-text">{bubble}</div>
            <button className="pet-change-link" onClick={()=>{ setPickerOpen(true); setBubble(null); }}>
              {lang==="zh" ? `🐾 换一只 (${def.name.zh})` : `🐾 Change pet (${def.name.en})`}
            </button>
          </div>
        )}
        <div className={"pet-body pet-anim-" + def.anim + " mood-" + mood}
             onPointerDown={onPointerDown}>
          {PetArt[def.id](mood)}
          <div className="pet-shadow"/>
        </div>
        <button className="pet-swap-btn"
          onPointerDown={e => e.stopPropagation()}
          onClick={()=>setPickerOpen(true)}
          title={lang==="zh" ? "更换桌宠" : "Change pet"}>
          <Icon name="sparkle" size={11}/>
        </button>
      </div>

      <PetPicker open={pickerOpen} onClose={()=>setPickerOpen(false)} current={petId} onSelect={setPetId} lang={lang}/>
    </>
  );
}

/* ---------- Picker overlay ---------- */
function PetPicker({ open, onClose, current, onSelect, lang }){
  if (!open) return null;
  return (
    <div className="pet-picker-scrim" onClick={onClose}>
      <div className="pet-picker" onClick={e=>e.stopPropagation()}>
        <header className="pp-head">
          <div>
            <h3>{lang==="zh" ? "选择你的桌宠" : "Choose your companion"}</h3>
            <p>{lang==="zh" ? "每只小伙伴都有自己的小动作。" : "Each has its own little animation."}</p>
          </div>
          <button className="icon-btn" onClick={onClose}><Icon name="close" size={16}/></button>
        </header>
        <div className="pp-list">
          {PET_DEFS.map(p => (
            <button key={p.id}
              className={"pp-row" + (current===p.id?" current":"")}
              onClick={()=>{ onSelect(p.id); onClose(); }}>
              <div className={"pp-avatar pet-anim-" + p.anim}>
                {PetArt[p.id]("idle")}
              </div>
              <div className="pp-meta">
                <div className="pp-name">{p.name[lang]}</div>
                <div className="pp-desc">{p.desc[lang]}</div>
              </div>
              <span className={"pp-btn" + (current===p.id?" selected":"")}>
                {current===p.id ? (lang==="zh" ? "已选" : "Selected") : (lang==="zh" ? "选择" : "Select")}
              </span>
            </button>
          ))}
        </div>
        <footer className="pp-foot">
          <span>{lang==="zh" ? "拖动桌宠到任何位置 · 点击查看小贴士" : "Drag the pet anywhere · Click for a tip"}</span>
        </footer>
      </div>
    </div>
  );
}

window.DesktopPet = DesktopPet;
