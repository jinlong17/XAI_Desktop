/* ============================================================
   AI module — Gemini-style chat with breathing nature animation
   ============================================================ */
const Icon = window.Icon;

const MODELS = [
  { id:"haiku",  name:"Haiku 4.5",   desc:{en:"Fast everyday model.", zh:"快速日常模型。"} },
  { id:"sonnet", name:"Sonnet 4.5",  desc:{en:"Balanced reasoning.",  zh:"均衡推理。"} },
  { id:"opus",   name:"Opus 4.1",    desc:{en:"Deepest reasoning.",   zh:"最深度推理。"} },
];

const STARTERS_EN = [
  "Summarize my overdue tasks and suggest a plan",
  "What time of day am I most productive?",
  "Draft a daily standup from yesterday's done items",
  "Generate a 25-min focus playlist concept",
];
const STARTERS_ZH = [
  "帮我汇总过期任务并给出排期建议",
  "我一天中最高效的时段是什么？",
  "根据昨天完成的事写一段日报",
  "给我策划一段 25 分钟的专注音乐主题",
];

function AIModule({ lang }){
  const { s } = window.useI18n(lang);
  const [convos, setConvos] = useState(() => {
    try {
      const saved = JSON.parse(localStorage.getItem("xai_ai_convos") || "null");
      if (Array.isArray(saved)) return saved;
    } catch(e){}
    return [
      { id:"c1", title: lang==="zh"?"周复盘思路":"Weekly review ideas",         time:"今天" },
      { id:"c2", title: lang==="zh"?"专注节奏分析":"Focus rhythm analysis",     time:"昨天" },
      { id:"c3", title: lang==="zh"?"番茄钟最佳时长":"Best pomodoro length",    time:"5/19" },
      { id:"c4", title: lang==="zh"?"任务优先级建议":"Task priority advice",    time:"5/18" },
    ];
  });
  useEffect(()=>{ try { localStorage.setItem("xai_ai_convos", JSON.stringify(convos)); } catch(e){} }, [convos]);

  const [activeConvo, setActiveConvo] = useState(null);
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [model, setModel]    = useState("haiku");
  const [modelOpen, setModelOpen] = useState(false);
  const [showInsights, setShowInsights] = useState(() => {
    try { return JSON.parse(localStorage.getItem("xai_ai_insights") || "false"); } catch(e){ return false; }
  });
  useEffect(()=>{ try { localStorage.setItem("xai_ai_insights", JSON.stringify(showInsights)); } catch(e){} }, [showInsights]);
  const [voiceOn, setVoiceOn] = useState(() => {
    try { return JSON.parse(localStorage.getItem("xai_ai_voice") || "true"); } catch(e){ return true; }
  });
  useEffect(()=>{ try { localStorage.setItem("xai_ai_voice", JSON.stringify(voiceOn)); } catch(e){} }, [voiceOn]);
  const [input, setInput]    = useState("");
  const [messages, setMessages] = useState([]); // {role, text}
  const [thinking, setThinking] = useState(false);
  const [attachments, setAttachments] = useState([]);
  const fileRef = useRef(null);
  const endRef  = useRef(null);

  useEffect(() => { endRef.current?.scrollIntoView({behavior:"smooth"}); }, [messages, thinking]);

  const send = async (textOverride) => {
    const text = (textOverride || input).trim();
    if (!text) return;
    const userMsg = { role:"user", text, attachments: attachments.length ? attachments.map(a=>a.name) : null };
    setMessages(m => [...m, userMsg]);
    setInput("");
    setAttachments([]);
    setThinking(true);
    if (!activeConvo) {
      const id = "c-" + Date.now().toString(36);
      setConvos(cs => [{ id, title: text.slice(0, 32), time: lang==="zh"?"刚刚":"Just now" }, ...cs]);
      setActiveConvo(id);
    }
    try {
      const reply = await window.claude.complete(text);
      setMessages(m => [...m, { role:"assistant", text: reply }]);
    } catch(err) {
      setMessages(m => [...m, { role:"assistant", text: lang==="zh"
        ? "（演示）我会综合你的任务、专注数据与习惯进度，给你一份贴近实际的建议。当前网络暂不可用，请稍后再试。"
        : "(Demo) I'd weave your tasks, focus data, and habit streaks into a tailored plan. Network unavailable right now — try again in a moment." }]);
    } finally {
      setThinking(false);
    }
  };

  const onFile = (e) => {
    const files = [...(e.target.files || [])].slice(0, 4);
    setAttachments(a => [...a, ...files.map(f => ({ name:f.name, size:f.size }))]);
    e.target.value = "";
  };

  const newChat = () => {
    setActiveConvo(null);
    setMessages([]);
    setInput("");
    setAttachments([]);
  };

  const starters = lang==="zh" ? STARTERS_ZH : STARTERS_EN;
  const empty = messages.length === 0;

  return (
    <div className="module module-ai">
      <aside className={"ai-side" + (sidebarOpen?" open":"")}>
        <header className="ai-side-head">
          <button className="icon-btn" onClick={()=>setSidebarOpen(false)} title={lang==="zh"?"收起":"Collapse"}>
            <Icon name="list" size={16}/>
          </button>
          <button className="ai-new-btn" onClick={newChat}>
            <Icon name="plus" size={13}/>
            <span>{lang==="zh"?"新对话":"New chat"}</span>
          </button>
        </header>
        <div className="ai-search">
          <Icon name="search" size={13}/>
          <input placeholder={lang==="zh"?"搜索对话":"Search chats"}/>
        </div>
        <div className="ai-side-section">
          <div className="ai-side-label">{lang==="zh"?"最近":"Recent"}</div>
          <ul className="ai-convos">
            {convos.map(c => (
              <li key={c.id}
                className={"ai-convo-row" + (activeConvo===c.id?" active":"")}
                onClick={()=>{ setActiveConvo(c.id); setMessages([]); }}>
                <Icon name="sparkle" size={12}/>
                <span className="ai-convo-title">{c.title}</span>
                <span className="ai-convo-time mono">{c.time}</span>
              </li>
            ))}
          </ul>
        </div>
      </aside>

      <main className={"ai-main" + (sidebarOpen?" with-side":"")}>
        {!sidebarOpen && (
          <button className="ai-open-side has-tip" data-tip={lang==="zh"?"打开侧栏":"Open sidebar"} onClick={()=>setSidebarOpen(true)}>
            <Icon name="list" size={16}/>
          </button>
        )}
        <button className="ai-new-corner has-tip" data-tip={lang==="zh"?"新对话":"New chat"} onClick={newChat}>
          <Icon name="plus" size={14}/>
        </button>
        <button className={"ai-insights-toggle has-tip" + (showInsights?" on":"")}
          data-tip={showInsights ? (lang==="zh"?"隐藏洞察":"Hide insights") : (lang==="zh"?"显示洞察":"Show insights")}
          onClick={()=>setShowInsights(v=>!v)}>
          <Icon name="sparkle" size={13}/>
          <span className="ait-label">{showInsights ? (lang==="zh"?"洞察已开":"Insights on") : (lang==="zh"?"洞察":"Insights")}</span>
          <span className="ait-dot"/>
        </button>

        {/* Breathing orb backdrop */}
        <div className={"ai-stage" + (thinking?" thinking":"") + (empty?" empty":" chatting")}>
          <BreathingOrb thinking={thinking}/>
        </div>

        <div className="ai-content">
          {empty ? (
            <div className="ai-welcome">
              <h1>{lang==="zh"?"今天想从哪里开始？":"Where should we start?"}</h1>
              {showInsights && (
                <div className="ai-starters">
                  {starters.map((p,i) => (
                    <button key={i} className="ai-starter" onClick={()=>send(p)}>
                      <Icon name="sparkle" size={13}/>
                      <span>{p}</span>
                    </button>
                  ))}
                </div>
              )}
            </div>
          ) : (
            <div className="ai-thread">
              {messages.map((m, i) => (
                <div key={i} className={"ai-msg ai-msg-" + m.role}>
                  {m.role === "assistant" && <span className="ai-avatar"><Icon name="sparkle" size={13}/></span>}
                  <div className="ai-bubble">
                    {m.text}
                    {m.attachments && (
                      <div className="ai-msg-attach">
                        {m.attachments.map((a,j)=><span key={j} className="ai-pill"><Icon name="paperclip" size={10}/> {a}</span>)}
                      </div>
                    )}
                  </div>
                </div>
              ))}
              {thinking && (
                <div className="ai-msg ai-msg-assistant">
                  <span className="ai-avatar"><Icon name="sparkle" size={13}/></span>
                  <div className="ai-bubble ai-typing"><span/><span/><span/></div>
                </div>
              )}
              <div ref={endRef}/>
            </div>
          )}
        </div>

        {/* Composer */}
        <div className="ai-composer-wrap">
          {attachments.length > 0 && (
            <div className="ai-attach-row">
              {attachments.map((a,i) => (
                <span key={i} className="ai-attach-chip">
                  <Icon name="paperclip" size={11}/>
                  <span>{a.name}</span>
                  <button onClick={()=>setAttachments(at=>at.filter((_,j)=>j!==i))}><Icon name="close" size={10}/></button>
                </span>
              ))}
            </div>
          )}
          <div className="ai-composer">
            <button className="ai-icon-round" onClick={()=>fileRef.current?.click()} title={lang==="zh"?"附件":"Attach"}>
              <Icon name="plus" size={16}/>
            </button>
            <input type="file" ref={fileRef} hidden multiple onChange={onFile}/>
            <input
              className="ai-input"
              value={input}
              onChange={e=>setInput(e.target.value)}
              onKeyDown={e=>{ if(e.key==="Enter" && !e.shiftKey){ e.preventDefault(); send(); } }}
              placeholder={lang==="zh"?"询问 XAI":"Ask XAI"}/>
            <div className="ai-model-wrap">
              <button className="ai-model-btn" onClick={()=>setModelOpen(o=>!o)}>
                {MODELS.find(m=>m.id===model).name}
                <Icon name="chevD" size={11}/>
              </button>
              {modelOpen && (
                <>
                  <div className="popover-scrim" onClick={()=>setModelOpen(false)}/>
                  <div className="popover ai-model-popover">
                    {MODELS.map(m => (
                      <button key={m.id}
                        className={"popover-item" + (model===m.id?" active":"")}
                        onClick={()=>{ setModel(m.id); setModelOpen(false); }}>
                        <div>
                          <div style={{fontWeight:700}}>{m.name}</div>
                          <div style={{fontSize:11,opacity:.65,marginTop:2}}>{m.desc[lang]}</div>
                        </div>
                        {model===m.id && <Icon name="check2" size={14} color="var(--accent)"/>}
                      </button>
                    ))}
                  </div>
                </>
              )}
            </div>
            <button className={"ai-icon-round" + (voiceOn?"":" muted")}
              onClick={()=>setVoiceOn(v=>!v)}
              title={voiceOn ? (lang==="zh"?"语音已开":"Voice on") : (lang==="zh"?"语音已关":"Voice off")}>
              <Icon name={voiceOn?"sound":"soundOff"} size={15}/>
            </button>
            <button className="ai-send" onClick={()=>send()} disabled={!input.trim()}>
              <Icon name="arrowR" size={14}/>
            </button>
          </div>
          <div className="ai-foot-hint">{lang==="zh"?"按 Enter 发送 · Shift + Enter 换行":"Enter to send · Shift+Enter for newline"}</div>
        </div>
      </main>
    </div>
  );
}

/* Breathing orb — layered radial gradients + flowing aurora + stars */
function BreathingOrb({ thinking }){
  return (
    <>
      <div className={"ai-aurora" + (thinking?" thinking":"")}>
        <div className="aurora-stream as-1"/>
        <div className="aurora-stream as-2"/>
        <div className="aurora-stream as-3"/>
        <div className="aurora-blob ab-1"/>
        <div className="aurora-blob ab-2"/>
        <div className="aurora-blob ab-3"/>
        <div className="aurora-blob ab-4"/>
        <div className="aurora-blob ab-5"/>
        <div className="ai-stars">
          {Array.from({length: 60}).map((_,i)=>(
            <span key={i} className="star" style={{
              left: `${(i*53)%100}%`,
              top: `${(i*97)%100}%`,
              animationDelay: `${(i%7)*0.7}s`,
              animationDuration: `${3 + (i%5)}s`,
              opacity: 0.3 + ((i%5) * 0.15),
            }}/>
          ))}
        </div>
        <div className="ai-grain"/>
      </div>
      <div className={"orb" + (thinking?" orb-thinking":"")}>
        <div className="orb-layer orb-1"/>
        <div className="orb-layer orb-2"/>
        <div className="orb-layer orb-3"/>
        <div className="orb-noise"/>
      </div>
    </>
  );
}

window.AIModule = AIModule;
