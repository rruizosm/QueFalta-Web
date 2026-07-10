// frame.jsx — marco del teléfono, status bar, bottom nav y primitivas compartidas.
import React from 'react';
import { useTk, Icon } from './theme.jsx';

export const SCREEN_W = 320, SCREEN_H = 644;

function StatusBar() {
  const t = useTk();
  return (
    <div style={{
      height: 30, flex: '0 0 auto', display: 'flex', alignItems: 'center',
      justifyContent: 'space-between', padding: '0 18px', color: t.ink,
      fontFamily: t.fontBody, fontSize: 12, fontWeight: 600, letterSpacing: '0.02em',
    }}>
      <span>9:41</span>
      <div style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
        <svg width="15" height="11" viewBox="0 0 18 12" fill={t.ink}><rect x="0" y="7" width="3" height="5" rx="1" /><rect x="5" y="4" width="3" height="8" rx="1" /><rect x="10" y="1.5" width="3" height="10.5" rx="1" fillOpacity="0.4" /></svg>
        <svg width="15" height="11" viewBox="0 0 18 14" fill="none" stroke={t.ink} strokeWidth="1.6"><path d="M2 6.5C5.5 3 12.5 3 16 6.5M4.5 9C7 6.6 11 6.6 13.5 9M9 11.4l.01-.01" /></svg>
        <svg width="22" height="11" viewBox="0 0 26 13" fill="none" stroke={t.ink} strokeWidth="1.3"><rect x="1" y="1" width="21" height="11" rx="3" /><rect x="3" y="3" width="13" height="7" rx="1.5" fill={t.ink} /><rect x="23" y="4.5" width="2" height="4" rx="1" fill={t.ink} /></svg>
      </div>
    </div>
  );
}

export function Phone({ children, tab, noNav, image, alt = '', eager }) {
  const t = useTk();
  return (
    <div style={{
      width: SCREEN_W, height: SCREEN_H, background: '#0c0b09', borderRadius: 38,
      padding: 9, boxShadow: '0 24px 60px rgba(20,16,12,0.28), 0 0 0 1px rgba(0,0,0,0.4)',
      position: 'relative',
    }}>
      <div style={{
        width: '100%', height: '100%', borderRadius: 30, overflow: 'hidden',
        background: t.bg, display: 'flex', flexDirection: 'column', position: 'relative',
        fontFamily: t.fontBody, color: t.ink,
      }}>
        {/* camera punch-hole */}
        <div style={{ position: 'absolute', top: 11, left: '50%', transform: 'translateX(-50%)', width: 9, height: 9, borderRadius: '50%', background: '#0c0b09', zIndex: 30 }} />
        {image ? (
          // Captura real a pantalla completa (ya trae status bar y nav propias).
          <img
            src={image}
            alt={alt}
            loading={eager ? 'eager' : 'lazy'}
            decoding="async"
            // Minúsculas a propósito: React 18 no conoce fetchPriority (llega en
            // el 19) y los atributos desconocidos en minúscula sí se emiten.
            fetchpriority={eager ? 'high' : undefined}
            style={{ width: '100%', height: '100%', display: 'block' }}
          />
        ) : (
          <>
            <StatusBar />
            <div style={{ flex: 1, minHeight: 0, position: 'relative', overflow: 'hidden' }}>{children}</div>
            {!noNav && <BottomNav active={tab} />}
          </>
        )}
      </div>
    </div>
  );
}

const NAV = [
  { id: 'home', label: 'Inicio', icon: 'home' },
  { id: 'catalog', label: 'Catálogo', icon: 'grid' },
  { id: 'list', label: 'Lista', icon: 'list' },
  { id: 'groups', label: 'Grupos', icon: 'users' },
];

export function BottomNav({ active = 'home' }) {
  const t = useTk();
  return (
    <div style={{
      flex: '0 0 auto', display: 'flex', justifyContent: 'space-around', alignItems: 'center',
      paddingTop: 8, paddingBottom: 14, background: t.surface,
      borderTop: t.borderWidth ? `${t.borderWidth}px solid ${t.border}` : `1px solid ${t.border}`,
    }}>
      {NAV.map((n) => {
        const on = n.id === active;
        return (
          <div key={n.id} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 3, flex: 1 }}>
            {on && t.icon !== 'none' && t.radius >= 16 ? (
              <div style={{ background: t.accentSoft, borderRadius: 14, padding: '3px 14px' }}>
                <Icon name={n.icon} size={20} color={t.accent} />
              </div>
            ) : (
              <Icon name={n.icon} size={20} color={on ? t.accent : t.inkFaint} />
            )}
            <span style={{
              fontSize: 9.5, fontWeight: on ? 700 : 500, color: on ? t.accent : t.inkFaint,
              fontFamily: t.fontBody, textTransform: t.upper ? 'uppercase' : 'none',
              letterSpacing: t.upper ? '0.06em' : '0',
            }}>{n.label}</span>
          </div>
        );
      })}
    </div>
  );
}

export function Avatar({ m, size = 30, ring }) {
  const t = useTk();
  const bg = t.id === 'mono' ? '#2b2925' : m.color;
  return (
    <div style={{
      width: size, height: size, borderRadius: t.id === 'bold' ? Math.min(6, t.radius) : '50%',
      background: bg, color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center',
      fontSize: size * 0.36, fontWeight: 700, fontFamily: t.fontBody, flex: '0 0 auto',
      border: ring ? `2px solid ${ring}` : 'none',
    }}>{m.initials}</div>
  );
}

export function Avatars({ members, max = 4, size = 30 }) {
  const t = useTk();
  const shown = members.slice(0, max);
  const extra = members.length - shown.length;
  return (
    <div style={{ display: 'flex', alignItems: 'center' }}>
      {shown.map((m, i) => (
        <div key={m.id} style={{ marginLeft: i === 0 ? 0 : -size * 0.32, zIndex: 10 - i }}>
          <Avatar m={m} size={size} ring={t.surface} />
        </div>
      ))}
      {extra > 0 && (
        <div style={{
          marginLeft: -size * 0.32, width: size, height: size, borderRadius: t.id === 'bold' ? Math.min(6, t.radius) : '50%',
          background: t.surfaceAlt, color: t.inkSoft, border: `2px solid ${t.surface}`,
          display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: size * 0.32,
          fontWeight: 700, fontFamily: t.fontBody, zIndex: 1,
        }}>+{extra}</div>
      )}
    </div>
  );
}

export function Progress({ value, height = 8 }) {
  const t = useTk();
  return (
    <div style={{ width: '100%', height, background: t.id === 'bold' ? t.surfaceAlt : t.accentSoft, borderRadius: height, overflow: 'hidden', border: t.id === 'bold' ? `1.5px solid ${t.ink}` : 'none' }}>
      <div style={{ width: `${Math.round(value * 100)}%`, height: '100%', background: t.accent, borderRadius: height }} />
    </div>
  );
}

export function Ring({ value, size = 54, stroke = 6, children }) {
  const t = useTk();
  const r = (size - stroke) / 2, c = 2 * Math.PI * r;
  return (
    <div style={{ position: 'relative', width: size, height: size, flex: '0 0 auto' }}>
      <svg width={size} height={size} style={{ transform: 'rotate(-90deg)' }}>
        <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke={t.accentSoft} strokeWidth={stroke} />
        <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke={t.accent} strokeWidth={stroke}
          strokeDasharray={c} strokeDashoffset={c * (1 - value)} strokeLinecap="round" />
      </svg>
      <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: size * 0.26, fontWeight: 800, color: t.ink, fontFamily: t.fontDisplay }}>{children}</div>
    </div>
  );
}

export function Check({ on, size = 22 }) {
  const t = useTk();
  return (
    <div style={{
      width: size, height: size, flex: '0 0 auto',
      borderRadius: t.id === 'neo' ? '50%' : Math.min(7, t.radius || 6),
      border: on ? `2px solid ${t.accent}` : `2px solid ${t.inkFaint}`,
      background: on ? t.accent : 'transparent',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
    }}>{on && <Icon name="check" size={size * 0.62} color={t.onAccent} stroke={2.6} />}</div>
  );
}
