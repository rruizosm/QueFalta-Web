// screens-catalog.jsx — Catálogo section, 4 layouts by theme.
function CatTabs({ t }) {
  if (t.id === 'mono') {
    return (
      <div style={{ display: 'flex', gap: 22, marginTop: 14, borderBottom: `1px solid ${t.border}` }}>
        <span style={{ fontFamily: t.fontBody, fontSize: 13, fontWeight: 700, color: t.ink, paddingBottom: 8, borderBottom: `2px solid ${t.ink}`, marginBottom: -1 }}>Categorías</span>
        <span style={{ fontFamily: t.fontBody, fontSize: 13, fontWeight: 500, color: t.inkFaint, paddingBottom: 8 }}>Productos</span>
      </div>
    );
  }
  if (t.id === 'bold') {
    return (
      <div style={{ display: 'flex', gap: 0, marginTop: 14, border: `2.5px solid ${t.ink}`, boxShadow: `3px 3px 0 ${t.ink}` }}>
        <div style={{ flex: 1, textAlign: 'center', padding: '9px 0', background: t.accent, fontFamily: t.fontBody, fontSize: 12, fontWeight: 700, textTransform: 'uppercase', borderRight: `2.5px solid ${t.ink}` }}>Categorías</div>
        <div style={{ flex: 1, textAlign: 'center', padding: '9px 0', background: t.surface, fontFamily: t.fontBody, fontSize: 12, fontWeight: 700, textTransform: 'uppercase', color: t.inkSoft }}>Productos</div>
      </div>
    );
  }
  return (
    <div style={{ display: 'flex', gap: 4, marginTop: 14, background: t.surfaceAlt, borderRadius: 999, padding: 4 }}>
      {['Categorías', 'Productos'].map((x, i) => (
        <div key={x} style={{ flex: 1, textAlign: 'center', padding: '8px 0', borderRadius: 999, background: i === 0 ? t.surface : 'transparent', boxShadow: i === 0 && t.id === 'neo' ? '0 2px 8px rgba(0,0,0,0.08)' : 'none', fontFamily: t.fontBody, fontSize: 12.5, fontWeight: 700, color: i === 0 ? t.ink : t.inkSoft }}>{x}</div>
      ))}
    </div>
  );
}

function CatalogScreen() {
  const t = useTk();
  const cats = CATEGORIES;

  if (t.id === 'mono') {
    return (
      <div style={{ height: '100%', overflow: 'hidden', padding: '20px 24px' }}>
        <Title size={32}>Catálogo</Title>
        <CatTabs t={t} />
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '12px 0', borderBottom: `1px solid ${t.ink}`, marginBottom: 4 }}>
          <Icon name="search" size={17} color={t.inkSoft} />
          <span style={{ fontFamily: t.fontBody, fontSize: 13.5, color: t.inkFaint }}>Buscar categorías…</span>
        </div>
        <div>
          {cats.slice(0, 8).map((c, i) => (
            <div key={c.id} style={{ display: 'flex', alignItems: 'baseline', gap: 12, padding: '11px 0', borderBottom: `1px solid ${t.border}` }}>
              <span style={{ fontFamily: t.fontBody, fontSize: 11, color: t.inkFaint, width: 18 }}>{String(i + 1).padStart(2, '0')}</span>
              <span style={{ flex: 1, fontFamily: t.fontDisplay, fontSize: 18 }}>{c.name}</span>
              <span style={{ fontFamily: t.fontBody, fontSize: 11.5, color: t.inkSoft }}>{c.sub}</span>
              <Icon name="chevron" size={15} color={t.inkFaint} />
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (t.id === 'bold') {
    return (
      <div style={{ height: '100%', overflow: 'hidden', padding: '18px 18px' }}>
        <Title size={30} style={{ textTransform: 'uppercase' }}>Catálogo</Title>
        <CatTabs t={t} />
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '11px 14px', border: `2.5px solid ${t.ink}`, marginTop: 14, marginBottom: 14, background: t.surface }}>
          <Icon name="search" size={17} color={t.ink} />
          <span style={{ fontFamily: t.fontBody, fontSize: 12.5, color: t.inkFaint, textTransform: 'uppercase' }}>Buscar…</span>
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          {cats.slice(0, 5).map((c) => (
            <div key={c.id} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: 12, border: `2.5px solid ${t.ink}`, boxShadow: `3px 3px 0 ${t.ink}`, background: t.surface }}>
              <Icon name={c.icon} size={22} color={t.ink} />
              <span style={{ flex: 1, fontFamily: t.fontBody, fontSize: 13, fontWeight: 700, textTransform: 'uppercase' }}>{c.name}</span>
              <span style={{ fontFamily: t.fontBody, fontSize: 11, fontWeight: 700, background: t.accent, padding: '2px 7px', border: `1.5px solid ${t.ink}` }}>{c.sub}</span>
            </div>
          ))}
        </div>
      </div>
    );
  }

  const neo = t.id === 'neo';
  return (
    <div style={{ height: '100%', overflow: 'hidden', padding: `${t.sp(16)}px ${screenPad(t)}px` }}>
      <Title size={28}>Catálogo</Title>
      <CatTabs t={t} />
      <div style={{ margin: '14px 0' }}>
        <Field icon="search" placeholder="Buscar categorías…" />
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: t.sp(9) }}>
        {cats.slice(0, neo ? 5 : 5).map((c) => (
          <Card key={c.id} flat={!neo} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: `${t.sp(11)}px ${t.sp(13)}px` }}>
            <div style={{ width: 42, height: 42, borderRadius: neo ? 14 : '50%', background: hexA(c.color, 0.13), display: 'flex', alignItems: 'center', justifyContent: 'center', flex: '0 0 auto' }}>
              <Icon name={c.icon} size={21} color={c.color} />
            </div>
            <div style={{ flex: 1 }}>
              <div style={{ fontFamily: t.fontBody, fontSize: 13.5, fontWeight: 700, color: t.ink }}>{c.name}</div>
              <div style={{ fontFamily: t.fontBody, fontSize: 11.5, color: t.inkSoft, marginTop: 1 }}>{c.sub} subcategorías</div>
            </div>
            <Icon name="chevron" size={17} color={t.inkFaint} />
          </Card>
        ))}
      </div>
    </div>
  );
}

Object.assign(window, { CatalogScreen });
