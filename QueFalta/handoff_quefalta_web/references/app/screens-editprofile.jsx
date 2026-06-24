// screens-editprofile.jsx — Editar perfil: foto + nombre + @usuario. Token-driven.
// Exports: EditProfileBody, EditProfileSheet, EditProfileScreen

function FieldLabel({ children, style = {} }) {
  const t = useTk();
  return (
    <div style={{ fontFamily: t.fontBody, fontSize: 10.5, fontWeight: 700, color: t.inkSoft, textTransform: 'uppercase', letterSpacing: '0.14em', marginBottom: t.sp(6), ...style }}>{children}</div>
  );
}

function InputBox({ children, focused, style = {} }) {
  const t = useTk();
  return (
    <div style={{
      display: 'flex', alignItems: 'center', gap: 8,
      padding: `${t.sp(11)}px ${t.sp(13)}px`,
      background: t.id === 'mono' ? 'transparent' : t.surface,
      borderRadius: t.id === 'bold' ? t.radius : Math.max(t.radius, 8),
      border: `${(t.borderWidth || 1) + (focused ? 0.5 : 0)}px solid ${focused ? t.accent : t.border}`,
      boxShadow: focused ? `0 0 0 3px ${t.accentSoft}` : (t.id === 'neo' ? t.shadow : 'none'),
      ...style,
    }}>{children}</div>
  );
}

function Helper({ children, ok }) {
  const t = useTk();
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 5, marginTop: t.sp(6), fontFamily: t.fontBody, fontSize: 11.5, color: ok ? t.ok : t.inkSoft, lineHeight: 1.4 }}>
      {ok && <Icon name="check" size={13} color={t.ok} stroke={2.4} />}
      <span>{children}</span>
    </div>
  );
}

function EditProfileBody() {
  const t = useTk();
  return (
    <div style={{ padding: `${t.sp(8)}px ${screenPad(t)}px ${t.sp(18)}px` }}>
      {/* Photo */}
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: t.sp(8), marginBottom: t.sp(16) }}>
        <div style={{ position: 'relative' }}>
          <div style={{
            width: 88, height: 88, borderRadius: t.id === 'bold' ? Math.min(8, t.radius) : '50%',
            background: t.id === 'mono' ? t.ink : '#df4b2e', color: '#fff',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: 32, fontWeight: 700, fontFamily: t.fontBody,
            border: t.id === 'bold' ? `2.5px solid ${t.ink}` : 'none',
            boxShadow: t.id === 'bold' ? `3px 3px 0 ${t.ink}` : t.shadow,
          }}>RU</div>
          <div style={{
            position: 'absolute', right: -2, bottom: -2,
            width: 32, height: 32, borderRadius: t.id === 'bold' ? Math.min(6, t.radius) : '50%',
            background: t.accent, color: t.onAccent,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            border: `2.5px solid ${t.bg}`,
            boxShadow: t.id === 'bold' ? `2px 2px 0 ${t.ink}` : 'none',
          }}>
            <Icon name="camera" size={16} color={t.onAccent} stroke={1.8} />
          </div>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: t.sp(14) }}>
          <span style={{ fontFamily: t.fontBody, fontSize: 13, fontWeight: 700, color: t.accent, textTransform: t.upper ? 'uppercase' : 'none' }}>Cambiar foto</span>
          <span style={{ width: 1, height: 12, background: t.border }} />
          <span style={{ display: 'flex', alignItems: 'center', gap: 4, fontFamily: t.fontBody, fontSize: 13, fontWeight: 600, color: t.inkSoft }}>
            <Icon name="trash" size={13} color={t.inkSoft} />Quitar
          </span>
        </div>
      </div>

      {/* Nombre */}
      <div style={{ marginBottom: t.sp(14) }}>
        <FieldLabel>Nombre</FieldLabel>
        <InputBox>
          <span style={{ flex: 1, fontFamily: t.fontBody, fontSize: 14.5, fontWeight: 500, color: t.ink }}>Rubén Vega</span>
        </InputBox>
      </div>

      {/* @usuario */}
      <div style={{ marginBottom: t.sp(14) }}>
        <FieldLabel>Nombre de usuario</FieldLabel>
        <InputBox focused>
          <span style={{ fontFamily: t.fontBody, fontSize: 15, fontWeight: 700, color: t.inkFaint }}>@</span>
          <span style={{ flex: 1, fontFamily: t.fontBody, fontSize: 14.5, fontWeight: 600, color: t.ink }}>rubenvega</span>
          <span style={{ width: 2, height: 17, background: t.accent, borderRadius: 2, marginRight: 2 }} />
          <span style={{ display: 'flex', alignItems: 'center', gap: 4, flex: '0 0 auto', fontFamily: t.fontBody, fontSize: 11.5, fontWeight: 700, color: t.ok }}>
            <Icon name="check" size={13} color={t.ok} stroke={2.4} />Libre
          </span>
        </InputBox>
        <Helper>Tu @ es único. Así te encuentran y te añaden a los grupos.</Helper>
      </div>

      {/* Correo (read-only) */}
      <div style={{ marginBottom: t.sp(18) }}>
        <FieldLabel>Correo</FieldLabel>
        <InputBox style={{ background: t.id === 'mono' ? 'transparent' : t.surfaceAlt }}>
          <span style={{ flex: 1, fontFamily: t.fontBody, fontSize: 14, fontWeight: 500, color: t.inkSoft, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>ruben.vega@gmail.com</span>
          <Icon name="lock" size={15} color={t.inkFaint} />
        </InputBox>
        <Helper>
          <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}><Icon name="google" size={12} />Conectado con Google · no editable</span>
        </Helper>
      </div>

      {/* Save (full) */}
      <div style={{
        display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
        padding: `${t.sp(13)}px 0`,
        borderRadius: t.id === 'bold' ? t.radius : (t.radius >= 18 ? 999 : Math.max(t.radius, 10)),
        background: t.accent, color: t.onAccent,
        border: t.id === 'bold' ? `2.5px solid ${t.ink}` : 'none',
        boxShadow: t.id === 'bold' ? `3px 3px 0 ${t.ink}` : 'none',
        fontFamily: t.fontBody, fontSize: 14.5, fontWeight: 700, textTransform: t.upper ? 'uppercase' : 'none', letterSpacing: t.upper ? '0.05em' : '0',
      }}>
        <Icon name="check" size={17} color={t.onAccent} stroke={2.4} />Guardar cambios
      </div>
    </div>
  );
}

// Slide-up sheet over the profile (used inside the phone)
function EditProfileSheet({ open, onClose }) {
  const t = useTk();
  const rad = t.id === 'bold' ? 0 : Math.max(t.radiusLg, 16);
  return (
    <>
      <div onClick={onClose} style={{ position: 'absolute', inset: 0, background: 'rgba(20,16,12,0.42)', opacity: open ? 1 : 0, pointerEvents: open ? 'auto' : 'none', transition: 'opacity .25s', zIndex: 50 }} />
      <div style={{
        position: 'absolute', left: 0, right: 0, bottom: 0, top: 6, background: t.bg,
        borderTopLeftRadius: rad, borderTopRightRadius: rad,
        borderTop: t.id === 'bold' ? `2.5px solid ${t.ink}` : `1px solid ${t.border}`,
        boxShadow: '0 -12px 34px rgba(20,16,12,0.22)',
        transform: open ? 'translateY(0)' : 'translateY(103%)',
        transition: 'transform .32s cubic-bezier(.2,.8,.2,1)', zIndex: 51,
        display: 'flex', flexDirection: 'column', overflow: 'hidden',
      }}>
        <EditHeader onClose={onClose} />
        <div style={{ flex: 1, minHeight: 0, overflow: 'hidden' }}>
          <EditProfileBody />
        </div>
      </div>
    </>
  );
}

function EditHeader({ onClose }) {
  const t = useTk();
  return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: `${t.sp(14)}px ${screenPad(t)}px ${t.sp(6)}px` }}>
      <span onClick={onClose} style={{ fontFamily: t.fontBody, fontSize: 13.5, fontWeight: 600, color: t.inkSoft, cursor: 'pointer', textTransform: t.upper ? 'uppercase' : 'none' }}>Cancelar</span>
      <span style={{ fontFamily: t.fontDisplay, fontSize: 17, fontWeight: t.dispWeight, textTransform: t.id === 'bold' ? 'uppercase' : 'none' }}>Editar perfil</span>
      <span onClick={onClose} style={{ fontFamily: t.fontBody, fontSize: 13.5, fontWeight: 700, color: t.accent, cursor: 'pointer', textTransform: t.upper ? 'uppercase' : 'none' }}>Guardar</span>
    </div>
  );
}

// Standalone board
function EditProfileScreen() {
  const t = useTk();
  return (
    <div style={{ height: '100%', display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
      <EditHeader onClose={() => {}} />
      <div style={{ flex: 1, minHeight: 0, overflow: 'hidden' }}>
        <EditProfileBody />
      </div>
    </div>
  );
}

Object.assign(window, { EditProfileBody, EditProfileSheet, EditProfileScreen, EditHeader });
