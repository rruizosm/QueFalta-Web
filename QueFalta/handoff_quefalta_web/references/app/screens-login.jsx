// screens-login.jsx — Login section, 4 layouts by theme.
function GoogleBtn({ label = 'Continuar con Google' }) {
  const t = useTk();
  return (
    <div style={{
      display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 11,
      padding: `${t.sp(14)}px ${t.sp(18)}px`, width: '100%',
      background: t.id === 'bold' ? t.accent : t.surface,
      color: t.ink,
      borderRadius: t.id === 'bold' ? t.radius : (t.radius >= 18 ? 999 : Math.max(t.radius, 12)),
      border: `${t.borderWidth || 1}px solid ${t.id === 'bold' ? t.ink : t.border}`,
      boxShadow: t.id === 'bold' ? `3px 3px 0 ${t.ink}` : (t.id === 'neo' ? t.shadow : 'none'),
      fontFamily: t.fontBody, fontSize: 14.5, fontWeight: 700,
      textTransform: t.upper ? 'uppercase' : 'none', letterSpacing: t.upper ? '0.05em' : '0',
    }}>
      <Icon name="google" size={18} />
      {label}
    </div>
  );
}

function LoginScreen() {
  const t = useTk();
  const legal = 'Al continuar aceptas los Términos de Servicio y la Política de Privacidad.';

  if (t.id === 'mono') {
    return (
      <div style={{ height: '100%', display: 'flex', flexDirection: 'column', padding: '46px 26px 30px' }}>
        <Eyebrow>Lista de la compra compartida</Eyebrow>
        <div style={{ height: 1, background: t.ink, marginTop: 14, marginBottom: 'auto' }} />
        <div style={{ marginTop: 40 }}>
          <Title size={62} style={{ lineHeight: 0.92 }}>La<br/>Compra</Title>
          <div style={{ marginTop: 18, fontFamily: t.fontBody, fontSize: 14, color: t.inkSoft, lineHeight: 1.5, maxWidth: 220 }}>
            Una libreta común para la cesta de todos. Sencilla. En papel y tinta.
          </div>
        </div>
        <div style={{ marginTop: 'auto', display: 'flex', flexDirection: 'column', gap: 16 }}>
          <GoogleBtn />
          <div style={{ fontFamily: t.fontBody, fontSize: 10.5, color: t.inkFaint, lineHeight: 1.6 }}>{legal}</div>
        </div>
      </div>
    );
  }

  if (t.id === 'bold') {
    return (
      <div style={{ height: '100%', display: 'flex', flexDirection: 'column', padding: '40px 22px 28px' }}>
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
          <div style={{ display: 'inline-block', background: t.accent, border: `2.5px solid ${t.ink}`, boxShadow: `4px 4px 0 ${t.ink}`, padding: '4px 12px', alignSelf: 'flex-start', marginBottom: 18 }}>
            <span style={{ fontFamily: t.fontBody, fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em' }}>v2.0 · Compartida</span>
          </div>
          <Title size={56} style={{ lineHeight: 0.9, textTransform: 'uppercase' }}>La<br/>Compra</Title>
          <div style={{ marginTop: 16, fontFamily: t.fontBody, fontSize: 13, color: t.inkSoft, lineHeight: 1.6 }}>
            La cesta del grupo. Sin líos. Sin grupos de chat infinitos.
          </div>
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          <GoogleBtn />
          <div style={{ fontFamily: t.fontBody, fontSize: 10, color: t.inkFaint, lineHeight: 1.6, textTransform: 'uppercase', letterSpacing: '0.03em' }}>{legal}</div>
        </div>
      </div>
    );
  }

  // fresco + neo: centered hero
  const fresco = t.id === 'fresco';
  return (
    <div style={{ height: '100%', display: 'flex', flexDirection: 'column', padding: '30px 26px 30px', background: fresco ? t.bg : t.surfaceAlt }}>
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', textAlign: 'center', gap: 20 }}>
        <div style={{
          width: 96, height: 96, borderRadius: t.id === 'neo' ? 30 : '50%',
          background: t.accent, display: 'flex', alignItems: 'center', justifyContent: 'center',
          boxShadow: t.shadow,
        }}>
          <Icon name="cart" size={46} color={t.onAccent} stroke={1.6} />
        </div>
        <div>
          <Title size={38}>LaCompra</Title>
          <div style={{ marginTop: 10, fontFamily: t.fontBody, fontSize: 15, color: t.inkSoft, lineHeight: 1.5, maxWidth: 230 }}>
            Tu lista de la compra, compartida con quien quieras.
          </div>
        </div>
        <div style={{ display: 'flex', gap: 6, marginTop: 4 }}>
          {[0, 1, 2].map((i) => <div key={i} style={{ width: i === 0 ? 22 : 7, height: 7, borderRadius: 999, background: i === 0 ? t.accent : t.border }} />)}
        </div>
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 16, alignItems: 'center' }}>
        <GoogleBtn />
        <div style={{ fontFamily: t.fontBody, fontSize: 11, color: t.inkFaint, lineHeight: 1.6, textAlign: 'center', maxWidth: 250 }}>{legal}</div>
      </div>
    </div>
  );
}

Object.assign(window, { LoginScreen });
