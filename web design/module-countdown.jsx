/* ============================================================
   Countdown module — visual cards
   ============================================================ */
const Icon = window.Icon;
const MOCK = window.MOCK;

function CountdownModule({ lang }){
  const { s } = window.useI18n(lang);

  return (
    <div className="module module-countdown">
      <header className="module-head">
        <h1 className="module-title">{s("countdown.title")} <Icon name="chevD" size={14}/></h1>
        <span className="grow"></span>
        <button className="icon-btn"><Icon name="plus" size={16}/></button>
        <button className="icon-btn"><Icon name="dots" size={16}/></button>
      </header>

      <div className="countdown-grid">
        {MOCK.countdowns.map(c => (
          <CountdownCard key={c.id} card={c} lang={lang}/>
        ))}
        <AddCountdownCard lang={lang}/>
      </div>
    </div>
  );
}

function CountdownCard({ card, lang }){
  const isLight = card.tone === "light";
  const color = card.color || "var(--accent)";
  return (
    <div className={"cd-card" + (isLight?" light":"")} style={{background: card.bg}}>
      {/* texture overlay for image-style cards */}
      {isLight && <div className="cd-overlay"/>}
      <div className="cd-head">
        <span className="cd-emoji">
          {card.id==="c2" ? "🎏" : card.id==="c3" ? "🎈" : card.id==="c4" ? "🏮" : null}
        </span>
        <span className="cd-title">{card.title[lang]}</span>
      </div>
      <div className="cd-num mono" style={isLight ? {color:"#fff"} : {color}}>
        {card.days}
      </div>
      <div className="cd-foot">
        {card.direction === "since"
          ? `${s_(lang,"countdown.days_since")} ${card.since}`
          : `${s_(lang,"countdown.days_until")} ${card.until}`}
      </div>
    </div>
  );
}
function s_(lang, path){
  return path.split(".").reduce((o,k)=>o?.[k], window.I18N[lang]) ?? path;
}

function AddCountdownCard({ lang }){
  return (
    <button className="cd-card cd-add">
      <Icon name="plus" size={20}/>
      <span>{lang==="zh" ? "新建倒计时" : "Add Countdown"}</span>
    </button>
  );
}

window.CountdownModule = CountdownModule;
