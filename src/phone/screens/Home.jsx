// Home.jsx — Inicio. La landing usa el layout "fresco".
import React from 'react';
import { useTk, Icon, hexA } from '../theme.jsx';
import { Avatar, Avatars, Progress, Ring } from '../frame.jsx';
import { Card, Title, Eyebrow, IconBtn, screenPad } from '../ui.jsx';
import { USER, GROUPS, CATEGORIES } from '../data.jsx';
import { ProfileBody, EditOpenCtx } from './Profile.jsx';
import { EditProfileSheet } from './EditProfile.jsx';

const ProfileOpenCtx = React.createContext(() => {});

function UserAvatar({ size }) {
  const open = React.useContext(ProfileOpenCtx);
  return (
    <button onClick={open} aria-label="Abrir perfil" style={{ padding: 0, margin: 0, border: 'none', background: 'none', cursor: 'pointer', display: 'block', lineHeight: 0 }}>
      <Avatar m={USER} size={size} />
    </button>
  );
}

function ProfileSheet({ open, onClose }) {
  const t = useTk();
  const [edit, setEdit] = React.useState(false);
  const rad = t.id === 'bold' ? 0 : Math.max(t.radiusLg, 16);
  return (
    <EditOpenCtx.Provider value={() => setEdit(true)}>
      <div onClick={onClose} style={{ position: 'absolute', inset: 0, background: 'rgba(20,16,12,0.38)', opacity: open ? 1 : 0, pointerEvents: open ? 'auto' : 'none', transition: 'opacity .25s', zIndex: 40 }} />
      <div style={{
        position: 'absolute', left: 0, right: 0, bottom: 0, top: 12, background: t.bg,
        borderTopLeftRadius: rad, borderTopRightRadius: rad,
        borderTop: t.id === 'bold' ? `2.5px solid ${t.ink}` : `1px solid ${t.border}`,
        boxShadow: '0 -12px 34px rgba(20,16,12,0.2)',
        transform: open ? 'translateY(0)' : 'translateY(103%)',
        transition: 'transform .32s cubic-bezier(.2,.8,.2,1)', zIndex: 41,
        display: 'flex', flexDirection: 'column', overflow: 'hidden',
      }}>
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', paddingTop: 8 }}>
          <div style={{ width: 36, height: 4, borderRadius: 999, background: t.border }} />
        </div>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: `${t.sp(8)}px ${screenPad(t)}px ${t.sp(2)}px` }}>
          <span style={{ fontFamily: t.fontDisplay, fontSize: 20, fontWeight: t.dispWeight, textTransform: t.id === 'bold' ? 'uppercase' : 'none' }}>Perfil</span>
          <IconBtn icon="x" onClick={onClose} size={34} />
        </div>
        <div style={{ flex: 1, minHeight: 0, overflow: 'hidden' }}>
          <ProfileBody />
        </div>
      </div>
      <EditProfileSheet open={edit} onClose={() => setEdit(false)} />
    </EditOpenCtx.Provider>
  );
}

function HomeContent() {
  const t = useTk();
  const active = GROUPS[0]; // Casa
  const prog = active.done / active.total;
  const cats = CATEGORIES.slice(0, 6);
  const greetSub = '¿Qué necesitas hoy?';

  // ── Editorial Mono: ledger ───────────────────────────────────
  if (t.id === 'mono') {
    return (
      <div style={{ height: '100%', overflow: 'hidden', padding: '20px 24px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
          <div>
            <Eyebrow>Lunes · 2 jun</Eyebrow>
            <Title size={30} style={{ marginTop: 6 }}>Hola, Rubén.</Title>
          </div>
          <UserAvatar size={42} />
        </div>
        <div style={{ height: 1, background: t.ink, margin: '18px 0 14px' }} />

        <Eyebrow>Carrito activo</Eyebrow>
        <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between', marginTop: 8 }}>
          <span style={{ fontFamily: t.fontDisplay, fontSize: 26 }}>{active.name}</span>
          <span style={{ fontFamily: t.fontDisplay, fontSize: 30, whiteSpace: 'nowrap' }}>{active.done}<span style={{ color: t.inkFaint }}>/{active.total}</span></span>
        </div>
        <div style={{ marginTop: 10 }}><Progress value={prog} height={4} /></div>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 12 }}>
          <span style={{ fontFamily: t.fontBody, fontSize: 12.5, color: t.inkSoft }}>Quedan {active.total - active.done} artículos</span>
          <span style={{ fontFamily: t.fontBody, fontSize: 13, fontWeight: 700, color: t.ink }}>Ver cesta →</span>
        </div>

        <div style={{ height: 1, background: t.border, margin: '18px 0 12px' }} />
        <Eyebrow style={{ marginBottom: 8 }}>Catálogo</Eyebrow>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', columnGap: 18 }}>
          {cats.map((c, i) => (
            <div key={c.id} style={{ display: 'flex', alignItems: 'baseline', gap: 8, padding: '7px 0', borderBottom: `1px solid ${t.border}` }}>
              <span style={{ fontFamily: t.fontBody, fontSize: 10, color: t.inkFaint, width: 16, flex: '0 0 auto' }}>{String(i + 1).padStart(2, '0')}</span>
              <span style={{ fontFamily: t.fontBody, fontSize: 13, color: t.ink, fontWeight: 500, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{c.name}</span>
            </div>
          ))}
        </div>
      </div>
    );
  }

  // ── Bold Contrast: blocky ────────────────────────────────────
  if (t.id === 'bold') {
    return (
      <div style={{ height: '100%', overflow: 'hidden', padding: '18px 18px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
          <Title size={26} style={{ textTransform: 'uppercase' }}>Hola,<br />Rubén</Title>
          <UserAvatar size={44} />
        </div>
        <div style={{ background: t.accent, border: `2.5px solid ${t.ink}`, boxShadow: `4px 4px 0 ${t.ink}`, padding: 16, marginBottom: 18 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
            <span style={{ fontFamily: t.fontBody, fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em' }}>Carrito · {active.name}</span>
            <Icon name="cart" size={20} color={t.ink} />
          </div>
          <div style={{ fontFamily: t.fontDisplay, fontSize: 58, fontWeight: 800, lineHeight: 1, marginTop: 4 }}>{Math.round(prog * 100)}<span style={{ fontSize: 28 }}>%</span></div>
          <div style={{ fontFamily: t.fontBody, fontSize: 12, fontWeight: 700, textTransform: 'uppercase' }}>{active.done} de {active.total} recogidos</div>
        </div>
        <div style={{ fontFamily: t.fontBody, fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em', color: t.inkSoft, marginBottom: 10 }}>Catálogo</div>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
          {cats.slice(0, 4).map((c) => (
            <div key={c.id} style={{ border: `2.5px solid ${t.ink}`, boxShadow: `2px 2px 0 ${t.ink}`, padding: '12px 12px', background: t.surface, display: 'flex', alignItems: 'center', gap: 9 }}>
              <Icon name={c.icon} size={20} color={t.ink} />
              <span style={{ fontFamily: t.fontBody, fontSize: 12, fontWeight: 700, textTransform: 'uppercase' }}>{c.name.split(' ')[0]}</span>
            </div>
          ))}
        </div>
      </div>
    );
  }

  // ── Fresco + Neo: card app ───────────────────────────────────
  const neo = t.id === 'neo';
  return (
    <div style={{ height: '100%', overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
      <div style={{ padding: `${t.sp(16)}px ${screenPad(t)}px 0` }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: t.sp(16) }}>
          <div>
            <Title size={24}>Hola, Rubén 👋</Title>
            <div style={{ fontFamily: t.fontBody, fontSize: 13.5, color: t.inkSoft, marginTop: 3 }}>{greetSub}</div>
          </div>
          <UserAvatar size={44} />
        </div>

        {/* Active cart card */}
        <Card accent={!neo} style={{ marginBottom: t.sp(18) }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 12 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 11 }}>
              <div style={{ width: 40, height: 40, borderRadius: neo ? 13 : '50%', background: neo ? t.accentSoft : hexA('#ffffff', 0.22), display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <Icon name="cart" size={22} color={neo ? t.accent : t.onAccent} />
              </div>
              <div style={{ minWidth: 0 }}>
                <div style={{ fontSize: 10.5, fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', color: neo ? t.inkSoft : hexA('#ffffff', 0.8), whiteSpace: 'nowrap' }}>Carrito activo</div>
                <div style={{ fontFamily: t.fontDisplay, fontSize: 19, fontWeight: t.dispWeight, color: neo ? t.ink : t.onAccent, marginTop: 1, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{active.name}</div>
              </div>
            </div>
            {neo
              ? <Ring value={prog} size={50} stroke={6}>{Math.round(prog * 100)}%</Ring>
              : <span style={{ fontFamily: t.fontDisplay, fontSize: 26, fontWeight: t.dispWeight, color: t.onAccent, whiteSpace: 'nowrap', flex: '0 0 auto' }}>{active.done}/{active.total}</span>}
          </div>
          {!neo && <div style={{ marginTop: 14 }}><Progress value={prog} height={7} /></div>}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 14 }}>
            <span style={{ fontFamily: t.fontBody, fontSize: 12.5, color: neo ? t.inkSoft : hexA('#ffffff', 0.85), whiteSpace: 'nowrap' }}>Quedan {active.total - active.done} artículos</span>
            <div style={{ display: 'flex', alignItems: 'center', gap: 5, flex: '0 0 auto', padding: neo ? '7px 14px' : '7px 14px', borderRadius: 999, background: neo ? t.accent : hexA('#ffffff', 0.2), color: neo ? t.onAccent : t.onAccent, fontFamily: t.fontBody, fontSize: 12.5, fontWeight: 700, whiteSpace: 'nowrap' }}>
              Ver cesta <Icon name="arrowR" size={14} color={t.onAccent} />
            </div>
          </div>
        </Card>
      </div>

      {/* Categories */}
      <div style={{ paddingLeft: screenPad(t), marginBottom: t.sp(18) }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingRight: screenPad(t), marginBottom: 10 }}>
          <div style={{ fontFamily: t.fontDisplay, fontSize: 16, fontWeight: t.dispWeight }}>Catálogo</div>
          <span style={{ fontFamily: t.fontBody, fontSize: 12.5, fontWeight: 600, color: t.accent }}>Ver todo</span>
        </div>
        <div style={{ display: 'flex', gap: 9, overflow: 'hidden' }}>
          {cats.slice(0, 5).map((c) => (
            <div key={c.id} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6, flex: '0 0 auto' }}>
              <div style={{ width: 54, height: 54, borderRadius: neo ? 18 : '50%', background: hexA(c.color, 0.12), display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <Icon name={c.icon} size={24} color={c.color} />
              </div>
              <span style={{ fontFamily: t.fontBody, fontSize: 11, fontWeight: 600, color: t.inkSoft }}>{c.name.split(' ')[0]}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Groups */}
      <div style={{ paddingLeft: screenPad(t), paddingRight: screenPad(t), flex: 1, minHeight: 0 }}>
        <div style={{ fontFamily: t.fontDisplay, fontSize: 16, fontWeight: t.dispWeight, marginBottom: 10 }}>Mis grupos</div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: t.sp(9) }}>
          {GROUPS.slice(0, 3).map((g) => (
            <Card key={g.id} flat={neo ? false : true} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 10, padding: `${t.sp(11)}px ${t.sp(14)}px` }}>
              <div style={{ minWidth: 0 }}>
                <div style={{ fontFamily: t.fontBody, fontSize: 14, fontWeight: 700, color: t.ink, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{g.name}</div>
                <div style={{ fontFamily: t.fontBody, fontSize: 11.5, color: t.inkSoft, marginTop: 1, whiteSpace: 'nowrap' }}>{g.members.length} miembros{g.active ? ' · activo' : ''}</div>
              </div>
              <div style={{ flex: '0 0 auto' }}><Avatars members={g.members} max={3} size={26} /></div>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
}

export function HomeScreen() {
  const [open, setOpen] = React.useState(false);
  return (
    <ProfileOpenCtx.Provider value={() => setOpen(true)}>
      <div style={{ height: '100%', position: 'relative', overflow: 'hidden' }}>
        <HomeContent />
        <ProfileSheet open={open} onClose={() => setOpen(false)} />
      </div>
    </ProfileOpenCtx.Provider>
  );
}
