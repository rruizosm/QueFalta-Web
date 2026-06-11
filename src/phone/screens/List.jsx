// List.jsx — Mi Lista. La landing usa el layout "fresco".
import React from 'react';
import { useTk, hexA } from '../theme.jsx';
import { Check, Progress, Ring } from '../frame.jsx';
import { Title, screenPad } from '../ui.jsx';
import { LIST_ITEMS, euro } from '../data.jsx';

export function ListScreen() {
  const t = useTk();
  const items = LIST_ITEMS;
  const pending = items.filter((i) => !i.inCart);
  const done = items.filter((i) => i.inCart);
  const prog = done.length / items.length;
  const total = items.reduce((s, i) => s + i.price * i.qty, 0);

  const sectionLabel = (txt) => (
    <div style={{ fontFamily: t.fontBody, fontSize: 10.5, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.14em', color: t.inkSoft, margin: '14px 0 9px' }}>{txt}</div>
  );

  // ── Mono ledger ──────────────────────────────────────────────
  if (t.id === 'mono') {
    const Row = (it) => (
      <div key={it.id} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '11px 0', borderBottom: `1px solid ${t.border}`, opacity: it.inCart ? 0.5 : 1 }}>
        <Check on={it.inCart} size={19} />
        <span style={{ flex: 1, fontFamily: t.fontBody, fontSize: 14.5, fontWeight: 500, textDecoration: it.inCart ? 'line-through' : 'none' }}>{it.name}</span>
        <span style={{ fontFamily: t.fontDisplay, fontSize: 15, color: t.inkSoft }}>{it.qty} {it.unit}</span>
      </div>
    );
    return (
      <div style={{ height: '100%', display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
        <div style={{ flex: 1, minHeight: 0, overflow: 'hidden', padding: '20px 24px 0' }}>
          <Title size={30}>Casa</Title>
          <div style={{ fontFamily: t.fontBody, fontSize: 13, color: t.inkSoft, marginTop: 3 }}>{done.length} de {items.length} artículos recogidos</div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12, margin: '16px 0 2px' }}>
            <div style={{ flex: 1, height: 2, background: t.border, position: 'relative' }}>
              <div style={{ position: 'absolute', left: 0, top: 0, height: 2, width: `${prog * 100}%`, background: t.ink }} />
            </div>
            <span style={{ fontFamily: t.fontDisplay, fontSize: 16 }}>{Math.round(prog * 100)}%</span>
          </div>
          {sectionLabel(`Por recoger (${pending.length})`)}
          {pending.slice(0, 4).map(Row)}
          {sectionLabel(`En la cesta (${done.length})`)}
          {done.slice(0, 2).map(Row)}
        </div>
        <div style={{ flex: '0 0 auto', display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', padding: '14px 24px', borderTop: `1px solid ${t.ink}` }}>
          <span style={{ fontFamily: t.fontBody, fontSize: 12.5, textTransform: 'uppercase', letterSpacing: '0.1em', color: t.inkSoft }}>Total estimado</span>
          <span style={{ fontFamily: t.fontDisplay, fontSize: 22 }}>{euro(total)}</span>
        </div>
      </div>
    );
  }

  // ── Bold ─────────────────────────────────────────────────────
  if (t.id === 'bold') {
    const Row = (it) => (
      <div key={it.id} style={{ display: 'flex', alignItems: 'center', gap: 11, padding: '10px 12px', border: `2px solid ${t.ink}`, marginBottom: 8, background: it.inCart ? t.accent : t.surface }}>
        <Check on={it.inCart} size={20} />
        <span style={{ fontSize: 17 }}>{it.emoji}</span>
        <span style={{ flex: 1, fontFamily: t.fontBody, fontSize: 13, fontWeight: 700, textTransform: 'uppercase' }}>{it.name}</span>
        <span style={{ fontFamily: t.fontBody, fontSize: 11, fontWeight: 700 }}>{it.qty} {it.unit}</span>
      </div>
    );
    return (
      <div style={{ height: '100%', display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
        <div style={{ flex: 1, minHeight: 0, overflow: 'hidden', padding: '18px 18px 0' }}>
          <Title size={28} style={{ textTransform: 'uppercase' }}>Casa</Title>
          <div style={{ fontFamily: t.fontBody, fontSize: 11.5, fontWeight: 700, textTransform: 'uppercase', color: t.inkSoft, marginTop: 4, marginBottom: 12 }}>{done.length}/{items.length} recogidos · {Math.round(prog * 100)}%</div>
          <div style={{ height: 14, border: `2.5px solid ${t.ink}`, background: t.surface, marginBottom: 14, padding: 0 }}>
            <div style={{ height: '100%', width: `${prog * 100}%`, background: t.accent }} />
          </div>
          {pending.slice(0, 3).map(Row)}
          {done.slice(0, 2).map(Row)}
        </div>
        <div style={{ flex: '0 0 auto', display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '14px 18px 16px', background: t.accent, borderTop: `2.5px solid ${t.ink}` }}>
          <span style={{ fontFamily: t.fontBody, fontSize: 12, fontWeight: 700, textTransform: 'uppercase' }}>Total</span>
          <span style={{ fontFamily: t.fontDisplay, fontSize: 22, fontWeight: 800 }}>{euro(total)}</span>
        </div>
      </div>
    );
  }

  // ── Fresco + Neo ─────────────────────────────────────────────
  const neo = t.id === 'neo';
  const Row = (it) => (
    <div key={it.id} style={{ display: 'flex', alignItems: 'center', gap: 11, padding: `${t.sp(11)}px ${t.sp(13)}px`, marginBottom: t.sp(8),
      background: it.inCart ? t.accentSoft : t.surface, borderRadius: t.radius,
      border: t.borderWidth ? `${t.borderWidth}px solid ${it.inCart ? hexA(t.accent, 0.3) : t.border}` : 'none',
      boxShadow: neo && !it.inCart ? t.shadow : 'none' }}>
      <Check on={it.inCart} size={22} />
      <span style={{ fontSize: 18 }}>{it.emoji}</span>
      <div style={{ flex: 1 }}>
        <div style={{ fontFamily: t.fontBody, fontSize: 13.5, fontWeight: 600, textDecoration: it.inCart ? 'line-through' : 'none', color: it.inCart ? t.inkSoft : t.ink }}>{it.name}</div>
        <div style={{ fontFamily: t.fontBody, fontSize: 11, color: t.inkSoft }}>{it.qty} {it.unit}</div>
      </div>
      {it.inCart && <span style={{ fontFamily: t.fontBody, fontSize: 10, fontWeight: 700, color: t.onAccent, background: t.accent, padding: '3px 8px', borderRadius: 999 }}>En cesta</span>}
    </div>
  );
  return (
    <div style={{ height: '100%', display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
      <div style={{ flex: 1, minHeight: 0, overflow: 'hidden', padding: `${t.sp(16)}px ${screenPad(t)}px 0` }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            <Title size={24}>Casa</Title>
            <div style={{ fontFamily: t.fontBody, fontSize: 12.5, color: t.inkSoft, marginTop: 2 }}>{done.length} de {items.length} recogidos</div>
          </div>
          {neo && <Ring value={prog} size={48} stroke={6}>{Math.round(prog * 100)}%</Ring>}
        </div>
        {!neo && (
          <div style={{ margin: '14px 0 2px' }}>
            <Progress value={prog} height={8} />
          </div>
        )}
        {sectionLabel(`Por recoger (${pending.length})`)}
        {pending.slice(0, 3).map(Row)}
        {sectionLabel(`En la cesta (${done.length})`)}
        {done.slice(0, 2).map(Row)}
      </div>
      <div style={{ flex: '0 0 auto', display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: `${t.sp(13)}px ${screenPad(t)}px`, background: t.surface, borderTop: `${t.borderWidth || 1}px solid ${t.border}` }}>
        <span style={{ fontFamily: t.fontBody, fontSize: 13, color: t.inkSoft }}>Total estimado</span>
        <span style={{ fontFamily: t.fontDisplay, fontSize: 21, fontWeight: t.dispWeight }}>{euro(total)}</span>
      </div>
    </div>
  );
}
