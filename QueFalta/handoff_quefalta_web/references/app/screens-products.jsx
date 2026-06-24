// screens-products.jsx — Productos dentro de una subcategoría, 4 layouts by theme.
const SUBCAT = { category: 'Snacks y frutos secos', name: 'Frutos secos' };
const PROD = [
  { id: 'p1', name: 'Almendras tostadas', size: '200 g', price: 2.75, emoji: '🥜', qty: 2 },
  { id: 'p2', name: 'Nueces peladas', size: '200 g', price: 3.15, emoji: '🌰', qty: 0 },
  { id: 'p3', name: 'Anacardos tostados', size: '150 g', price: 2.95, emoji: '🥜', qty: 0 },
  { id: 'p4', name: 'Pistachos sin cáscara', size: '130 g', price: 3.45, emoji: '🥜', qty: 0 },
  { id: 'p5', name: 'Mix de frutos secos', size: '250 g', price: 3.20, emoji: '🥜', qty: 1 },
];

function Stepper({ value }) {
  const t = useTk();
  const square = t.id === 'bold';
  const btn = (icon) => (
    <div style={{
      width: 26, height: 26, flex: '0 0 auto', display: 'flex', alignItems: 'center', justifyContent: 'center',
      borderRadius: square ? Math.min(4, t.radius) : '50%',
      border: `${t.borderWidth || 1.5}px solid ${value > 0 ? t.accent : t.border}`,
      background: t.id === 'bold' && icon === 'plus' ? t.accent : 'transparent',
    }}>
      <Icon name={icon} size={14} color={value > 0 || t.id === 'bold' ? (t.id === 'bold' && icon === 'plus' ? t.ink : t.accent) : t.inkFaint} stroke={2.2} />
    </div>
  );
  if (value === 0) {
    return (
      <div style={{
        display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6, flex: '0 0 auto',
        padding: '6px 12px', borderRadius: square ? t.radius : 999,
        border: `${t.borderWidth || 1.5}px solid ${t.id === 'bold' ? t.ink : t.border}`,
        background: t.id === 'bold' ? t.accent : 'transparent',
        boxShadow: t.id === 'bold' ? `2px 2px 0 ${t.ink}` : 'none',
      }}>
        <Icon name="plus" size={15} color={t.id === 'bold' ? t.ink : t.accent} stroke={2.2} />
        <span style={{ fontFamily: t.fontBody, fontSize: 12, fontWeight: 700, color: t.id === 'bold' ? t.ink : t.accent, textTransform: t.upper ? 'uppercase' : 'none' }}>Añadir</span>
      </div>
    );
  }
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 9, flex: '0 0 auto' }}>
      {btn('minus')}
      <span style={{ fontFamily: t.fontDisplay, fontSize: 16, fontWeight: t.dispWeight, minWidth: 14, textAlign: 'center', color: t.ink }}>{value}</span>
      {btn('plus')}
    </div>
  );
}

function Thumb({ p, size = 50 }) {
  const t = useTk();
  if (t.id === 'mono') {
    return (
      <div style={{ width: size, height: size, flex: '0 0 auto', borderRadius: 0, border: `1px solid ${t.border}`, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <Icon name="photo" size={20} color={t.inkFaint} />
      </div>
    );
  }
  return (
    <div style={{ width: size, height: size, flex: '0 0 auto', borderRadius: t.id === 'bold' ? Math.min(4, t.radius) : (t.id === 'neo' ? 14 : t.radius), border: t.id === 'bold' ? `2px solid ${t.ink}` : 'none', background: t.surfaceAlt, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: size * 0.5 }}>
      {p.emoji}
    </div>
  );
}

function ProductsScreen() {
  const t = useTk();
  const selected = PROD.filter((p) => p.qty > 0);
  const count = selected.reduce((s, p) => s + p.qty, 0);

  // Header (shared, theme-aware)
  const Header = () => (
    <div style={{ display: 'flex', alignItems: 'center', gap: 12, padding: t.id === 'bold' ? '16px 18px 12px' : (t.id === 'mono' ? '20px 24px 10px' : `${t.sp(14)}px ${screenPad(t)}px ${t.sp(8)}px`) }}>
      {t.id === 'mono' ? <Icon name="back" size={22} color={t.ink} /> : <IconBtn icon="back" />}
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ fontFamily: t.fontDisplay, fontSize: t.id === 'bold' ? 22 : 21, fontWeight: t.dispWeight, textTransform: t.id === 'bold' ? 'uppercase' : 'none', lineHeight: 1.1 }}>{SUBCAT.name}</div>
        <div style={{ fontFamily: t.fontBody, fontSize: 11.5, color: t.inkSoft, marginTop: 2, textTransform: t.id === 'bold' ? 'uppercase' : 'none', letterSpacing: t.id === 'bold' ? '0.04em' : '0' }}>
          {SUBCAT.category} <span style={{ color: t.inkFaint }}>›</span> {SUBCAT.name}
        </div>
      </div>
    </div>
  );

  // Cart bar (dark, like the source)
  const CartBar = () => {
    if (count === 0) return null;
    const dark = t.id !== 'bold';
    return (
      <div style={{ flex: '0 0 auto', display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        padding: t.id === 'bold' ? '13px 18px 16px' : `${t.sp(13)}px ${screenPad(t)}px`,
        margin: t.id === 'neo' ? `0 ${screenPad(t)}px ${t.sp(12)}px` : '0',
        background: dark ? t.ink : t.accent,
        borderRadius: t.id === 'neo' ? t.radiusLg : 0,
        border: t.id === 'bold' ? `2.5px solid ${t.ink}` : 'none',
        borderTop: t.id === 'bold' ? `2.5px solid ${t.ink}` : (dark && t.id !== 'neo' ? 'none' : 'none') }}>
        <div style={{ minWidth: 0 }}>
          <div style={{ fontFamily: t.fontBody, fontSize: 13, fontWeight: 600, color: dark ? t.bg : t.ink, textTransform: t.upper ? 'uppercase' : 'none' }}>{count} artículos seleccionados</div>
          <div style={{ fontFamily: t.fontBody, fontSize: 11.5, color: t.accent, marginTop: 2 }}>→ Casa</div>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 6, flex: '0 0 auto',
          padding: '9px 16px', borderRadius: t.id === 'bold' ? t.radius : (t.radius >= 18 ? 999 : Math.max(t.radius, 9)),
          background: t.accent, color: t.onAccent, border: t.id === 'bold' ? `2px solid ${t.ink}` : 'none',
          fontFamily: t.fontBody, fontSize: 13, fontWeight: 700, textTransform: t.upper ? 'uppercase' : 'none' }}>
          Añadir <Icon name="arrowR" size={14} color={t.onAccent} />
        </div>
      </div>
    );
  };

  // ── Row variants ─────────────────────────────────────────────
  const Row = ({ p }) => {
    if (t.id === 'mono') {
      return (
        <div style={{ display: 'flex', alignItems: 'center', gap: 13, padding: '12px 0', borderBottom: `1px solid ${t.border}` }}>
          <Thumb p={p} size={44} />
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ fontFamily: t.fontBody, fontSize: 14, fontWeight: 600, color: t.ink }}>{p.name}</div>
            <div style={{ display: 'flex', alignItems: 'baseline', gap: 7, marginTop: 3 }}>
              <span style={{ fontFamily: t.fontBody, fontSize: 11.5, color: t.inkSoft, whiteSpace: 'nowrap' }}>{p.size}</span>
              <span style={{ fontFamily: t.fontDisplay, fontSize: 15, whiteSpace: 'nowrap' }}>{euro(p.price)}</span>
            </div>
          </div>
          <Stepper value={p.qty} />
        </div>
      );
    }
    const blocky = t.id === 'bold';
    const neo = t.id === 'neo';
    const active = p.qty > 0;
    return (
      <div style={{ display: 'flex', alignItems: 'center', gap: 12, padding: blocky ? '11px 12px' : `${t.sp(10)}px ${t.sp(12)}px`,
        marginBottom: t.sp(8), borderRadius: t.radius,
        background: active && !blocky ? t.accentSoft : t.surface,
        border: blocky ? `2px solid ${t.ink}` : (t.borderWidth ? `${t.borderWidth}px solid ${active ? hexA(t.accent, 0.35) : t.border}` : 'none'),
        boxShadow: blocky ? `3px 3px 0 ${t.ink}` : (neo ? t.shadow : 'none') }}>
        <Thumb p={p} size={50} />
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ fontFamily: t.fontBody, fontSize: 13.5, fontWeight: 600, color: t.ink, lineHeight: 1.2, textTransform: blocky ? 'uppercase' : 'none' }}>{p.name}</div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginTop: 3 }}>
            <span style={{ fontFamily: t.fontBody, fontSize: 11.5, color: t.inkSoft, whiteSpace: 'nowrap' }}>{p.size}</span>
            <span style={{ color: t.inkFaint }}>·</span>
            <span style={{ fontFamily: t.fontBody, fontSize: 12.5, fontWeight: 700, color: t.accent, whiteSpace: 'nowrap' }}>{euro(p.price)}</span>
          </div>
        </div>
        <Stepper value={p.qty} />
      </div>
    );
  };

  const listPad = t.id === 'mono' ? '0 24px' : (t.id === 'bold' ? '4px 18px 0' : `0 ${screenPad(t)}px`);
  return (
    <div style={{ height: '100%', display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
      <Header />
      <div style={{ flex: 1, minHeight: 0, overflow: 'hidden', padding: listPad, paddingTop: t.id === 'mono' ? 2 : 4 }}>
        {PROD.slice(0, t.id === 'bold' ? 4 : 5).map((p) => <Row key={p.id} p={p} />)}
      </div>
      <CartBar />
    </div>
  );
}

Object.assign(window, { ProductsScreen });
