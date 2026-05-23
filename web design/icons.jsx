/* ============================================================
   Icons — small, clean line icons (1.6px stroke)
   ============================================================ */
const Icon = ({ name, size = 18, color = "currentColor", style }) => {
  const paths = {
    // sidebar rail
    check:    <><path d="M9 11.5l2 2 4-4.5" /><rect x="3.5" y="3.5" width="17" height="17" rx="4.5" /></>,
    list:     <><path d="M3.5 6h17M3.5 12h17M3.5 18h12" /></>,
    grid4:    <><rect x="3.5" y="3.5" width="7" height="7" rx="1.5" /><rect x="13.5" y="3.5" width="7" height="7" rx="1.5" /><rect x="3.5" y="13.5" width="7" height="7" rx="1.5" /><rect x="13.5" y="13.5" width="7" height="7" rx="1.5" /></>,
    timer:    <><circle cx="12" cy="13" r="7.5" /><path d="M12 13V8.5M9.5 3.5h5" /></>,
    pin:      <><path d="M12 21v-6.5" /><path d="M8 9V4h8v5l3 4.5H5L8 9z" /></>,
    search:   <><circle cx="11" cy="11" r="6.5" /><path d="M16 16l4.5 4.5" /></>,
    countdown:<><rect x="4" y="3.5" width="16" height="17" rx="2.5" /><path d="M4 9h16M9 13l2 2 4-4" /></>,
    sync:     <><path d="M4 11a7 7 0 0 1 12-4.9L19 9" /><path d="M19 5v4h-4" /><path d="M20 13a7 7 0 0 1-12 4.9L5 15" /><path d="M5 19v-4h4" /></>,
    bell:     <><path d="M6 16V11a6 6 0 0 1 12 0v5l1.5 2h-15L6 16z" /><path d="M10 20a2 2 0 0 0 4 0" /></>,
    help:     <><circle cx="12" cy="12" r="8.5" /><path d="M9.5 9.5a2.5 2.5 0 1 1 3.7 2.2c-.7.4-1.2 1-1.2 1.8v.5M12 17.5v.01" /></>,
    // module/sidebar
    inbox:    <><path d="M3.5 13l2.5-7.5h12l2.5 7.5v6.5a1 1 0 0 1-1 1h-15a1 1 0 0 1-1-1V13z" /><path d="M3.5 13h5l1.5 2.5h4l1.5-2.5h5" /></>,
    sun:      <><circle cx="12" cy="12" r="4" /><path d="M12 3v2M12 19v2M3 12h2M19 12h2M5.6 5.6l1.4 1.4M17 17l1.4 1.4M5.6 18.4 7 17M17 7l1.4-1.4" /></>,
    sunrise:  <><path d="M3 18h18M5 13a7 7 0 0 1 14 0M12 4v5M8 8l4-4 4 4" /></>,
    calendar: <><rect x="3.5" y="5" width="17" height="15.5" rx="2.5" /><path d="M3.5 10h17M8 3v4M16 3v4" /></>,
    tray:     <><path d="M3.5 4.5h17v15h-17z" /><path d="M3.5 13h5l1.5 2.5h4l1.5-2.5h5" /></>,
    chart:    <><path d="M4 20V8M10 20V4M16 20v-8M22 20H2" /></>,
    flag:     <><path d="M5 21V4M5 4h12l-2.5 4 2.5 4H5" /></>,
    tag:      <><path d="M11 3h7.5L21 5.5V13l-9 9-9-9 9-9z" /><circle cx="14.5" cy="9.5" r="1.3" /></>,
    filter:   <><path d="M3.5 5.5h17l-7 8v6l-3-1.5V13.5l-7-8z" /></>,
    trash:    <><path d="M5 7h14M9 7V4.5h6V7M7 7l1 13h8l1-13" /></>,
    arrowL:   <><path d="M14 6l-6 6 6 6" /></>,
    arrowR:   <><path d="M10 6l6 6-6 6" /></>,
    chevD:    <><path d="M6 9l6 6 6-6" /></>,
    chevR:    <><path d="M9 6l6 6-6 6" /></>,
    plus:     <><path d="M12 5v14M5 12h14" /></>,
    dots:     <><circle cx="6" cy="12" r="1.4" /><circle cx="12" cy="12" r="1.4" /><circle cx="18" cy="12" r="1.4" /></>,
    sliders:  <><path d="M4 7h12M4 12h7M4 17h14" /><circle cx="18" cy="7" r="2" /><circle cx="14" cy="12" r="2" /><circle cx="19" cy="17" r="2" /></>,
    sound:    <><path d="M4 10v4h3l4 3V7l-4 3H4z" /><path d="M16 9c1 1 1 5 0 6" /></>,
    soundOff: <><path d="M4 10v4h3l4 3V7l-4 3H4z" /><path d="M15 10l5 5M20 10l-5 5" /></>,
    fire:     <><path d="M12 21c-4 0-7-2.7-7-6.6 0-2.5 1.3-4 2.6-5.4C8 8 8.5 6.3 8 4c2.8 1 4.5 3.5 4.5 5.5 1-1 1.5-2 1.3-3.5 2.4 1.4 4.2 4 4.2 7.4 0 4-3 6.6-6 6.6z" /></>,
    bolt:     <><path d="M13 3 5 13h6l-1 8 8-10h-6l1-8z" /></>,
    target:   <><circle cx="12" cy="12" r="8" /><circle cx="12" cy="12" r="4.5" /><circle cx="12" cy="12" r="1.2" /></>,
    user:     <><circle cx="12" cy="8.5" r="3.5" /><path d="M5 20c1-3.5 4-5 7-5s6 1.5 7 5" /></>,
    star:     <><path d="M12 4l2.6 5.4 5.9.8-4.3 4.1 1 5.8-5.2-2.8L7 20l1-5.8-4.3-4.1 5.9-.8L12 4z" /></>,
    box:      <><path d="M3.5 7l8.5-4 8.5 4-8.5 4-8.5-4z" /><path d="M3.5 7v10l8.5 4 8.5-4V7" /><path d="M12 11v10" /></>,
    sparkle:  <><path d="M12 3v6M12 15v6M3 12h6M15 12h6M6 6l4 4M14 14l4 4M18 6l-4 4M6 18l4-4" /></>,
    clock:    <><circle cx="12" cy="12" r="8.5" /><path d="M12 7v5l3.5 2" /></>,
    type:     <><path d="M4 5h16M12 5v15M8 20h8" /></>,
    grip:     <><circle cx="9" cy="6" r="1.2" /><circle cx="15" cy="6" r="1.2" /><circle cx="9" cy="12" r="1.2" /><circle cx="15" cy="12" r="1.2" /><circle cx="9" cy="18" r="1.2" /><circle cx="15" cy="18" r="1.2" /></>,
    play:     <><path d="M7 5l12 7-12 7V5z" /></>,
    pause:    <><rect x="6" y="5" width="4" height="14" rx="1" /><rect x="14" y="5" width="4" height="14" rx="1" /></>,
    download: <><path d="M12 4v11M7 11l5 5 5-5M5 20h14" /></>,
    moon:     <><path d="M20 14a8 8 0 1 1-9-11 6 6 0 0 0 9 11z" /></>,
    monitor:  <><rect x="3" y="4.5" width="18" height="13" rx="2" /><path d="M8 21h8M12 17.5V21" /></>,
    language: <><circle cx="12" cy="12" r="8.5" /><path d="M3.5 12h17M12 3.5c2.5 2.5 3.8 5.7 3.8 8.5S14.5 18.5 12 21M12 3.5C9.5 6 8.2 9.2 8.2 12s1.3 6 3.8 8.5" /></>,
    // new
    kanban:   <><rect x="3.5" y="3.5" width="17" height="17" rx="2.5" /><path d="M8 7v6M12 7v10M16 7v4" /></>,
    layout:   <><rect x="3.5" y="3.5" width="17" height="17" rx="2.5" /><path d="M3.5 9.5h17M10 9.5V20" /></>,
    leaf:     <><path d="M5 19c0-8 6-14 14-14 0 8-6 14-14 14z" /><path d="M5 19c4-4 8-8 14-14" /></>,
    cloud:    <><path d="M7 17h10a4 4 0 1 0-1-7.9A6 6 0 0 0 5 12a3 3 0 0 0 2 5z" /></>,
    rain:     <><path d="M7 14h10a4 4 0 1 0-1-7.9A6 6 0 0 0 5 9a3 3 0 0 0 2 5z" /><path d="M9 18l-1 2M13 18l-1 2M17 18l-1 2" /></>,
    mail:     <><rect x="3.5" y="5" width="17" height="14" rx="2" /><path d="M3.5 7l8.5 6 8.5-6" /></>,
    note:     <><path d="M5 4.5h11l3 3v12a1 1 0 0 1-1 1H5a1 1 0 0 1-1-1V5.5a1 1 0 0 1 1-1z" /><path d="M16 4.5v3.5h3" /></>,
    globe:    <><circle cx="12" cy="12" r="8.5" /><path d="M3.5 12h17M12 3.5c2.3 2.5 3.6 5.6 3.6 8.5s-1.3 6-3.6 8.5M12 3.5C9.7 6 8.4 9.1 8.4 12s1.3 6 3.6 8.5" /></>,
    paw:      <><circle cx="6.5" cy="10" r="2"/><circle cx="11" cy="6.5" r="2"/><circle cx="15.5" cy="6.5" r="2"/><circle cx="20" cy="10" r="2"/><path d="M9 19c0-3 1.5-5 4-5s4 2 4 5c0 1.5-1 2.5-2 2.5-1 0-1.5-.5-2-.5s-1 .5-2 .5c-1 0-2-1-2-2.5z"/></>,
    play:     <><path d="M7 5l12 7-12 7V5z" /></>,
    close:    <><path d="M6 6l12 12M18 6l-6 6-6 6" /></>,
    expand:   <><path d="M14 4h6v6M4 14v6h6M14 4l6 6M10 14l-6 6" /></>,
    flame:    <><path d="M12 21c-4 0-7-2.7-7-6.6 0-2.5 1.3-4 2.6-5.4C8 8 8.5 6.3 8 4c2.8 1 4.5 3.5 4.5 5.5 1-1 1.5-2 1.3-3.5 2.4 1.4 4.2 4 4.2 7.4 0 4-3 6.6-6 6.6z" /></>,
    paperclip:<><path d="M19 12.5L11.5 20a4 4 0 1 1-5.7-5.7l9.4-9.4a3 3 0 0 1 4.3 4.3l-9 9a2 2 0 1 1-2.8-2.8l7.6-7.6" /></>,
    check2:   <><path d="M5 12l4 4 10-10" /></>,
  };
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none"
      stroke={color} strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"
      style={style}>{paths[name] || null}</svg>
  );
};

window.Icon = Icon;
