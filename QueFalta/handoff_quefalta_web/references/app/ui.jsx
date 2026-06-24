// ui.jsx — adaptive primitives that restyle per theme token. Exports: Pad, Scroll, Card, Title, Eyebrow, Chip, Btn, IconBtn, Divider, Field

function pad(t) { return t.sp(t.id === 'mono' ? 22 : 18); }

function Pad({ children, style = {} }) {
  const t = useTk();
  return <div style={{ paddingLeft: pad(t), paddingRight: pad(t), ...style }}>{children}</div>;
}

// Vertical fill region with internal scroll suppressed (static frame); just a column
function Scroll({ children, style = {}, padTop = 0 }) {
  const t = useTk();
  return (
    <div style={{ height: '100%', display: 'flex', flexDirection: 'column', paddingTop: t.sp(padTop), overflow: 'hidden', ...style }}>{children}</div>
  );
}

function Card({ children, style = {}, flat, accent, onAlt }) {
  const t = useTk();
  const bw = t.borderWidth;
  return (
    <div style={{
      background: accent ? t.accent : (onAlt ? t.surfaceAlt : t.surface),
      borderRadius: t.radius,
      border: bw ? `${bw}px solid ${t.border}` : 'none',
      boxShadow: flat ? 'none' : t.shadow,
      padding: t.sp(16),
      color: accent ? t.onAccent : t.ink,
      ...style,
    }}>{children}</div>
  );
}

function Title({ children, size = 26, style = {} }) {
  const t = useTk();
  return (
    <h1 style={{
      margin: 0, fontFamily: t.fontDisplay, fontWeight: t.dispWeight,
      fontStyle: t.dispItalic ? 'italic' : 'normal',
      fontSize: size * t.dispScale, lineHeight: 1.05, color: t.ink,
      letterSpacing: t.id === 'mono' ? '-0.01em' : '-0.005em', ...style,
    }}>{children}</h1>
  );
}

function Eyebrow({ children, style = {} }) {
  const t = useTk();
  return (
    <div style={{
      fontFamily: t.fontBody, fontSize: 10.5, fontWeight: 700, color: t.inkSoft,
      textTransform: 'uppercase', letterSpacing: '0.16em', ...style,
    }}>{children}</div>
  );
}

function Chip({ children, active, style = {}, color }) {
  const t = useTk();
  const c = color || t.accent;
  return (
    <div style={{
      display: 'inline-flex', alignItems: 'center', gap: 6,
      padding: `${t.sp(7)}px ${t.sp(13)}px`,
      borderRadius: t.id === 'bold' ? t.radius : 999,
      background: active ? c : (t.id === 'mono' ? 'transparent' : hexA(typeof c === 'string' && c[0] === '#' ? c : '#888888', 0.10)),
      color: active ? onAccent(c) : (t.id === 'mono' ? t.ink : c),
      border: t.id === 'mono' || t.id === 'bold' ? `${t.borderWidth || 1}px solid ${active ? c : t.border}` : 'none',
      fontFamily: t.fontBody, fontSize: 12.5, fontWeight: 600, whiteSpace: 'nowrap',
      ...style,
    }}>{children}</div>
  );
}

function Btn({ children, icon, variant = 'solid', full, onClick, style = {} }) {
  const t = useTk();
  const solid = variant === 'solid';
  return (
    <button onClick={onClick} style={{
      display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: 8,
      width: full ? '100%' : 'auto', cursor: 'pointer',
      padding: `${t.sp(12)}px ${t.sp(18)}px`,
      borderRadius: t.id === 'bold' ? t.radius : (t.radius >= 18 ? 999 : Math.max(t.radius, 10)),
      background: solid ? t.accent : 'transparent',
      color: solid ? t.onAccent : t.accent,
      border: solid ? (t.id === 'bold' ? `2.5px solid ${t.ink}` : 'none') : `${t.borderWidth || 1.5}px solid ${t.accent}`,
      boxShadow: t.id === 'bold' && solid ? `3px 3px 0 ${t.ink}` : 'none',
      fontFamily: t.fontBody, fontSize: 14, fontWeight: 700,
      textTransform: t.upper ? 'uppercase' : 'none', letterSpacing: t.upper ? '0.06em' : '0',
      ...style,
    }}>
      {icon && <Icon name={icon} size={17} color={solid ? t.onAccent : t.accent} />}
      {children}
    </button>
  );
}

function IconBtn({ icon, onClick, soft, size = 38, style = {} }) {
  const t = useTk();
  return (
    <button onClick={onClick} style={{
      width: size, height: size, flex: '0 0 auto', cursor: 'pointer',
      borderRadius: t.id === 'bold' ? t.radius : '50%',
      background: soft ? t.accentSoft : t.surface,
      border: soft ? 'none' : `${t.borderWidth || 1}px solid ${t.border}`,
      boxShadow: t.id === 'bold' ? `2px 2px 0 ${t.ink}` : 'none',
      display: 'flex', alignItems: 'center', justifyContent: 'center', ...style,
    }}>
      <Icon name={icon} size={19} color={soft ? t.accent : t.ink} />
    </button>
  );
}

function Divider({ style = {} }) {
  const t = useTk();
  return <div style={{ height: t.id === 'bold' ? 2 : 1, background: t.border, ...style }} />;
}

function Field({ icon, placeholder, style = {} }) {
  const t = useTk();
  return (
    <div style={{
      display: 'flex', alignItems: 'center', gap: 10,
      padding: `${t.sp(11)}px ${t.sp(14)}px`,
      background: t.id === 'mono' ? 'transparent' : t.surface,
      borderRadius: t.id === 'bold' ? t.radius : (t.radius >= 18 ? 999 : Math.max(t.radius, 10)),
      border: `${t.borderWidth || 1}px solid ${t.border}`,
      boxShadow: t.id === 'neo' ? t.shadow : 'none',
      ...style,
    }}>
      {icon && <Icon name={icon} size={18} color={t.inkSoft} />}
      <span style={{ color: t.inkFaint, fontFamily: t.fontBody, fontSize: 14 }}>{placeholder}</span>
    </div>
  );
}

Object.assign(window, { Pad, Scroll, Card, Title, Eyebrow, Chip, Btn, IconBtn, Divider, Field, screenPad: pad });
