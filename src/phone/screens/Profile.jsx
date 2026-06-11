// Profile.jsx — Perfil de usuario (token-driven; works in any theme/tweaks).
import React from 'react';
import { useTk, Icon, hexA } from '../theme.jsx';
import { Avatar } from '../frame.jsx';
import { Card, IconBtn, screenPad } from '../ui.jsx';
import { EditProfileSheet } from './EditProfile.jsx';

export const EditOpenCtx = React.createContext(() => {});

export function ProfileToggle({ on }) {
  const t = useTk();
  return (
    <div style={{
      width: 40, height: 23, flex: '0 0 auto',
      borderRadius: t.id === 'bold' ? Math.min(4, t.radius) : 999,
      background: on ? t.accent : t.border,
      border: t.id === 'bold' ? `2px solid ${t.ink}` : 'none',
      position: 'relative', transition: 'background .2s',
    }}>
      <div style={{
        position: 'absolute', top: on ? 2.5 : 2.5, left: on ? 19 : 2.5,
        width: 18, height: 18, borderRadius: t.id === 'bold' ? Math.min(3, t.radius) : '50%',
        background: '#fff', boxShadow: '0 1px 3px rgba(0,0,0,0.25)', transition: 'left .2s',
      }} />
    </div>
  );
}

function MenuRow({ icon, label, value, toggle, danger, last }) {
  const t = useTk();
  const col = danger ? '#d6452b' : t.ink;
  return (
    <div style={{
      display: 'flex', alignItems: 'center', gap: 13,
      padding: `${t.sp(12)}px 0`,
      borderBottom: last ? 'none' : `1px solid ${t.border}`,
    }}>
      <div style={{
        width: 34, height: 34, flex: '0 0 auto', display: 'flex', alignItems: 'center', justifyContent: 'center',
        borderRadius: t.id === 'bold' ? Math.min(5, t.radius) : (t.radius >= 16 ? 12 : t.radius),
        background: danger ? hexA('#d6452b', 0.10) : t.accentSoft,
      }}>
        <Icon name={icon} size={18} color={danger ? '#d6452b' : t.accent} />
      </div>
      <span style={{ flex: 1, fontFamily: t.fontBody, fontSize: 14, fontWeight: 600, color: col, textTransform: t.upper ? 'uppercase' : 'none', letterSpacing: t.upper ? '0.03em' : '0' }}>{label}</span>
      {value && <span style={{ fontFamily: t.fontBody, fontSize: 12.5, color: t.inkSoft, whiteSpace: 'nowrap' }}>{value}</span>}
      {toggle !== undefined ? <ProfileToggle on={toggle} /> : (!danger && <Icon name="chevron" size={16} color={t.inkFaint} />)}
    </div>
  );
}

function SectionLabel({ children }) {
  const t = useTk();
  return (
    <div style={{
      fontFamily: t.fontBody, fontSize: 10.5, fontWeight: 700, color: t.inkSoft,
      textTransform: 'uppercase', letterSpacing: '0.14em',
      margin: `${t.sp(14)}px 0 ${t.sp(2)}px`,
    }}>{children}</div>
  );
}

export function ProfileBody() {
  const t = useTk();
  const openEdit = React.useContext(EditOpenCtx);
  return (
    <div style={{ padding: `${t.sp(6)}px ${screenPad(t)}px ${t.sp(16)}px` }}>
      {/* Identity */}
      <Card style={{ display: 'flex', alignItems: 'center', gap: 13 }}>
        <Avatar m={{ initials: 'RU', color: '#df4b2e' }} size={54} />
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ fontFamily: t.fontDisplay, fontSize: 19, fontWeight: t.dispWeight, color: t.ink, lineHeight: 1.1 }}>Rubén Vega</div>
          <div style={{ fontFamily: t.fontBody, fontSize: 12.5, color: t.inkSoft, marginTop: 2, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>ruben.vega@gmail.com</div>
        </div>
        <div onClick={openEdit} style={{
          display: 'flex', alignItems: 'center', gap: 5, flex: '0 0 auto', cursor: 'pointer',
          padding: '7px 12px', borderRadius: t.id === 'bold' ? t.radius : (t.radius >= 18 ? 999 : Math.max(t.radius, 8)),
          border: `${t.borderWidth || 1.5}px solid ${t.accent}`, color: t.accent,
          fontFamily: t.fontBody, fontSize: 12, fontWeight: 700, textTransform: t.upper ? 'uppercase' : 'none',
        }}>
          <Icon name="edit" size={14} color={t.accent} />Editar
        </div>
      </Card>

      <SectionLabel>Cuenta</SectionLabel>
      <MenuRow icon="bell" label="Notificaciones" toggle={true} />
      <MenuRow icon="shield" label="Privacidad y seguridad" last />

      <SectionLabel>Preferencias</SectionLabel>
      <MenuRow icon="users" label="Grupo por defecto" value="Casa" />
      <MenuRow icon="moon" label="Apariencia" value="Claro" last />

      <SectionLabel>Grupos</SectionLabel>
      <MenuRow icon="userPlus" label="Invitar amigos" last />

      <SectionLabel>Soporte</SectionLabel>
      <MenuRow icon="help" label="Ayuda" />
      <MenuRow icon="info" label="Acerca de QueFalta" value="v2.0" last />

      {/* Log out */}
      <div style={{ marginTop: t.sp(18) }}>
        <div style={{
          display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
          padding: `${t.sp(12)}px 0`,
          borderRadius: t.id === 'bold' ? t.radius : (t.radius >= 18 ? 999 : Math.max(t.radius, 10)),
          border: `${t.borderWidth || 1.5}px solid ${hexA('#d6452b', 0.5)}`,
          background: hexA('#d6452b', 0.06), color: '#d6452b',
          boxShadow: t.id === 'bold' ? `3px 3px 0 ${t.ink}` : 'none',
          fontFamily: t.fontBody, fontSize: 14, fontWeight: 700, textTransform: t.upper ? 'uppercase' : 'none', letterSpacing: t.upper ? '0.05em' : '0',
        }}>
          <Icon name="logout" size={17} color="#d6452b" />Cerrar sesión
        </div>
      </div>
    </div>
  );
}

// Full standalone screen (with header)
export function ProfileScreen() {
  const t = useTk();
  const [edit, setEdit] = React.useState(false);
  return (
    <EditOpenCtx.Provider value={() => setEdit(true)}>
      <div style={{ height: '100%', display: 'flex', flexDirection: 'column', overflow: 'hidden', position: 'relative' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, padding: t.id === 'bold' ? '16px 18px 10px' : (t.id === 'mono' ? '20px 24px 8px' : `${t.sp(14)}px ${screenPad(t)}px ${t.sp(6)}px`) }}>
          {t.id === 'mono' ? <Icon name="back" size={22} color={t.ink} /> : <IconBtn icon="back" />}
          <span style={{ flex: 1, fontFamily: t.fontDisplay, fontSize: t.id === 'bold' ? 24 : 22, fontWeight: t.dispWeight, textTransform: t.id === 'bold' ? 'uppercase' : 'none' }}>Perfil</span>
        </div>
        <div style={{ flex: 1, minHeight: 0, overflow: 'hidden' }}>
          <ProfileBody />
        </div>
        <EditProfileSheet open={edit} onClose={() => setEdit(false)} />
      </div>
    </EditOpenCtx.Provider>
  );
}
