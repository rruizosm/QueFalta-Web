// GroupDetail.jsx — Detalle de grupo. La landing usa el layout "fresco".
import React from 'react';
import { useTk, Icon } from '../theme.jsx';
import { Avatars, Check } from '../frame.jsx';
import { Card, IconBtn, screenPad } from '../ui.jsx';
import { GROUPS, LIST_ITEMS, euro } from '../data.jsx';

export function GroupDetailScreen() {
  const t = useTk();
  const g = GROUPS[0]; // Casa
  const items = LIST_ITEMS.slice(0, 6);
  const total = items.reduce((s, i) => s + i.price * i.qty, 0);

  const Header = () => (
    <div style={{ display: 'flex', alignItems: 'center', gap: 12, padding: t.id === 'bold' ? '16px 18px 12px' : `${t.sp(14)}px ${screenPad(t)}px ${t.sp(10)}px` }}>
      {t.id === 'mono'
        ? <Icon name="back" size={22} color={t.ink} />
        : <IconBtn icon="back" />}
      <span style={{ flex: 1, fontFamily: t.fontDisplay, fontSize: t.id === 'bold' ? 22 : 21, fontWeight: t.dispWeight, textTransform: t.id === 'bold' ? 'uppercase' : 'none' }}>{g.name}</span>
      {t.id === 'mono'
        ? <Icon name="share" size={19} color={t.ink} />
        : <IconBtn icon="share" soft />}
    </div>
  );

  const Row = ({ it }) => {
    if (t.id === 'mono') {
      return (
        <div style={{ display: 'flex', alignItems: 'center', gap: 11, padding: '11px 0', borderBottom: `1px solid ${t.border}`, opacity: it.inCart ? 0.55 : 1 }}>
          <Check on={it.inCart} size={19} />
          <span style={{ flex: 1, fontFamily: t.fontBody, fontSize: 14, fontWeight: 500, textDecoration: it.inCart ? 'line-through' : 'none' }}>{it.name}</span>
          <span style={{ fontFamily: t.fontBody, fontSize: 11.5, color: t.inkSoft }}>{it.qty} {it.unit}</span>
          <span style={{ fontFamily: t.fontDisplay, fontSize: 15, width: 52, textAlign: 'right' }}>{euro(it.price * it.qty)}</span>
        </div>
      );
    }
    const blocky = t.id === 'bold';
    return (
      <div style={{ display: 'flex', alignItems: 'center', gap: 11, padding: blocky ? '11px 12px' : `${t.sp(10)}px ${t.sp(12)}px`,
        borderBottom: blocky ? 'none' : `1px solid ${t.border}`,
        border: blocky ? `2px solid ${t.ink}` : 'none', marginBottom: blocky ? 8 : 0,
        background: blocky ? (it.inCart ? t.surfaceAlt : t.surface) : 'transparent', opacity: it.inCart && !blocky ? 0.6 : 1 }}>
        <Check on={it.inCart} size={20} />
        <span style={{ fontSize: 18 }}>{it.emoji}</span>
        <div style={{ flex: 1 }}>
          <div style={{ fontFamily: t.fontBody, fontSize: 13.5, fontWeight: 600, textDecoration: it.inCart ? 'line-through' : 'none', color: it.inCart ? t.inkSoft : t.ink }}>{it.name}</div>
          <div style={{ fontFamily: t.fontBody, fontSize: 11, color: t.inkSoft }}>{it.qty} {it.unit}</div>
        </div>
        <span style={{ fontFamily: t.fontBody, fontSize: 13, fontWeight: 700, color: t.accent }}>{euro(it.price * it.qty)}</span>
      </div>
    );
  };

  const TotalBar = () => (
    <div style={{ flex: '0 0 auto', display: 'flex', alignItems: 'center', justifyContent: 'space-between',
      padding: t.id === 'bold' ? '14px 18px 16px' : `${t.sp(13)}px ${screenPad(t)}px`,
      background: t.id === 'bold' ? t.accent : t.surface,
      borderTop: `${t.id === 'bold' ? 2.5 : (t.borderWidth || 1)}px solid ${t.id === 'bold' ? t.ink : t.border}` }}>
      <span style={{ fontFamily: t.fontBody, fontSize: 13, color: t.id === 'bold' ? t.ink : t.inkSoft, textTransform: t.upper ? 'uppercase' : 'none', fontWeight: t.id === 'bold' ? 700 : 400 }}>Total estimado</span>
      <span style={{ fontFamily: t.fontDisplay, fontSize: 22, fontWeight: t.dispWeight }}>{euro(total)}</span>
    </div>
  );

  const membersBlock = (
    <>
      <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
        <Avatars members={g.members} max={6} size={32} />
      </div>
      <div style={{ fontFamily: t.fontBody, fontSize: 12.5, color: t.inkSoft, marginTop: 8 }}>
        {g.members.map((m) => m.name).join(', ')}
      </div>
    </>
  );

  const secTitle = (txt) => (
    <div style={{ fontFamily: t.id === 'mono' ? t.fontBody : t.fontDisplay, fontSize: t.id === 'mono' ? 10.5 : 14,
      fontWeight: t.id === 'mono' ? 700 : t.dispWeight, textTransform: t.id === 'mono' || t.id === 'bold' ? 'uppercase' : 'none',
      letterSpacing: t.id === 'mono' ? '0.14em' : '0', color: t.id === 'mono' ? t.inkSoft : t.ink, marginBottom: 10 }}>{txt}</div>
  );

  const useCards = t.id === 'fresco' || t.id === 'neo';
  return (
    <div style={{ height: '100%', display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
      <Header />
      <div style={{ flex: 1, minHeight: 0, overflow: 'hidden', padding: t.id === 'bold' ? '4px 18px 0' : `0 ${screenPad(t)}px` }}>
        {/* Members */}
        {useCards ? (
          <Card flat={t.id === 'fresco'} style={{ marginBottom: t.sp(12) }}>
            {secTitle(`Miembros (${g.members.length})`)}
            {membersBlock}
          </Card>
        ) : (
          <div style={{ marginBottom: 16, paddingBottom: t.id === 'mono' ? 14 : 0, borderBottom: t.id === 'mono' ? `1px solid ${t.ink}` : 'none', ...(t.id === 'bold' ? { border: `2.5px solid ${t.ink}`, boxShadow: `3px 3px 0 ${t.ink}`, padding: 14, background: t.surface } : {}) }}>
            {secTitle(`Miembros (${g.members.length})`)}
            {membersBlock}
          </div>
        )}
        {/* Cart */}
        {useCards ? (
          <Card flat={t.id === 'fresco'}>
            {secTitle('Cesta del grupo')}
            {items.slice(0, 4).map((it) => <Row key={it.id} it={it} />)}
          </Card>
        ) : (
          <div>
            {secTitle('Cesta del grupo')}
            {items.slice(0, t.id === 'bold' ? 3 : 5).map((it) => <Row key={it.id} it={it} />)}
          </div>
        )}
      </div>
      <TotalBar />
    </div>
  );
}
