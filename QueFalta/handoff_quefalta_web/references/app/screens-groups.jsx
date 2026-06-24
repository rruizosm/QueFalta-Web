// screens-groups.jsx — Grupos section, 4 layouts by theme.
function GroupsScreen() {
  const t = useTk();
  const groups = GROUPS;

  if (t.id === 'mono') {
    return (
      <div style={{ height: '100%', overflow: 'hidden', padding: '20px 24px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
          <Title size={32}>Grupos</Title>
          <span style={{ fontFamily: t.fontBody, fontSize: 13, fontWeight: 700 }}>+ Nuevo</span>
        </div>
        <div style={{ height: 1, background: t.ink, margin: '16px 0 4px' }} />
        {groups.map((g) => (
          <div key={g.id} style={{ padding: '16px 0', borderBottom: `1px solid ${t.border}` }}>
            <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between' }}>
              <span style={{ fontFamily: t.fontDisplay, fontSize: 22 }}>{g.name}</span>
              {g.owner && <span style={{ fontFamily: t.fontBody, fontSize: 10.5, textTransform: 'uppercase', letterSpacing: '0.12em', color: t.inkSoft }}>· Tuyo</span>}
            </div>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: 10 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <Avatars members={g.members} max={4} size={24} />
                <span style={{ fontFamily: t.fontBody, fontSize: 12, color: t.inkSoft, whiteSpace: 'nowrap' }}>{g.members.length} miembros</span>
              </div>
              <span style={{ fontFamily: t.fontBody, fontSize: 12.5, fontWeight: 700, color: t.ink, whiteSpace: 'nowrap', flex: '0 0 auto' }}>
                {g.active ? '● Carrito activo' : 'Activar →'}
              </span>
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (t.id === 'bold') {
    return (
      <div style={{ height: '100%', overflow: 'hidden', padding: '18px 18px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
          <Title size={30} style={{ textTransform: 'uppercase' }}>Grupos</Title>
          <div style={{ display: 'flex', alignItems: 'center', gap: 5, background: t.accent, border: `2.5px solid ${t.ink}`, boxShadow: `3px 3px 0 ${t.ink}`, padding: '7px 12px', fontFamily: t.fontBody, fontSize: 12, fontWeight: 700, textTransform: 'uppercase' }}>
            <Icon name="plus" size={15} color={t.ink} />Nuevo
          </div>
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          {groups.slice(0, 3).map((g) => (
            <div key={g.id} style={{ border: `2.5px solid ${t.ink}`, boxShadow: `3px 3px 0 ${t.ink}`, background: g.active ? t.accent : t.surface }}>
              <div style={{ padding: 14, display: 'flex', flexDirection: 'column', gap: 11 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ fontFamily: t.fontDisplay, fontSize: 20, fontWeight: 800, textTransform: 'uppercase' }}>{g.name}</span>
                  {g.owner && <span style={{ fontFamily: t.fontBody, fontSize: 10, fontWeight: 700, textTransform: 'uppercase', border: `1.5px solid ${t.ink}`, padding: '2px 6px', background: g.active ? t.surface : t.accent }}>Tuyo</span>}
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                  <Avatars members={g.members} max={4} size={28} />
                  <span style={{ fontFamily: t.fontBody, fontSize: 11.5, fontWeight: 700, textTransform: 'uppercase' }}>{g.members.length} miembros</span>
                </div>
                <div style={{ textAlign: 'center', padding: '9px 0', border: `2px solid ${t.ink}`, background: g.active ? t.surface : t.ink, color: g.active ? t.ink : t.bg, fontFamily: t.fontBody, fontSize: 12, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                  {g.active ? '✓ Carrito activo' : 'Activar carrito'}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  const neo = t.id === 'neo';
  return (
    <div style={{ height: '100%', overflow: 'hidden', padding: `${t.sp(16)}px ${screenPad(t)}px` }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: t.sp(16) }}>
        <Title size={28}>Grupos</Title>
        <Btn icon="plus">Nuevo</Btn>
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: t.sp(12) }}>
        {groups.slice(0, 3).map((g) => (
          <Card key={g.id} style={{ display: 'flex', flexDirection: 'column', gap: 12, border: !neo && g.active ? `1.5px solid ${t.accent}` : undefined }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <span style={{ fontFamily: t.fontDisplay, fontSize: 18, fontWeight: t.dispWeight }}>{g.name}</span>
                {g.owner && <span style={{ fontFamily: t.fontBody, fontSize: 10.5, fontWeight: 700, color: t.accent, background: t.accentSoft, padding: '2px 8px', borderRadius: 999 }}>Tuyo</span>}
              </div>
              <Icon name="chevron" size={16} color={t.inkFaint} />
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <Avatars members={g.members} max={4} size={30} />
              <span style={{ fontFamily: t.fontBody, fontSize: 12, color: t.inkSoft }}>{g.members.length} miembros</span>
            </div>
            <div style={{
              display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6,
              padding: '10px 0', borderRadius: t.radius >= 18 ? 999 : Math.max(t.radius, 10),
              background: g.active ? t.accent : 'transparent',
              border: g.active ? 'none' : `1.5px solid ${t.accent}`,
              color: g.active ? t.onAccent : t.accent, fontFamily: t.fontBody, fontSize: 12.5, fontWeight: 700,
            }}>
              <Icon name={g.active ? 'check' : 'cart'} size={15} color={g.active ? t.onAccent : t.accent} />
              {g.active ? 'Carrito activo' : 'Activar carrito'}
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}

Object.assign(window, { GroupsScreen });
