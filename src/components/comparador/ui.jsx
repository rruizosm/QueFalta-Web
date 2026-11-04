import { useState } from 'react';
import { STORE_BY_KEY } from '../../data/comparadorZonas.js';
import { useT } from './i18n.jsx';

// Piezas visuales compartidas por la home del comparador y la vista de súper.

const euro = new Intl.NumberFormat('es-ES', { style: 'currency', currency: 'EUR' });
export const fmt = (n) => euro.format(n);
export const UNIT_LABEL = { l: 'l', kg: 'kg', ud: 'ud' };

/* ─────────────────────────── Iconos ─────────────────────────── */

export const Icon = {
  search: (p) => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" {...p}><circle cx="11" cy="11" r="7" /><path d="m20 20-3.5-3.5" /></svg>
  ),
  pin: (p) => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" {...p}><path d="M12 21s-7-6.2-7-11.5A7 7 0 0 1 19 9.5C19 14.8 12 21 12 21Z" /><circle cx="12" cy="9.5" r="2.5" /></svg>
  ),
  close: (p) => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" aria-hidden="true" {...p}><path d="M6 6l12 12M18 6 6 18" /></svg>
  ),
  arrow: (p) => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" {...p}><path d="M5 12h14M13 6l6 6-6 6" /></svg>
  ),
  scale: (p) => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" {...p}><path d="M12 3v18M7 21h10M5 7h14M5 7l-3 6a3 3 0 0 0 6 0L5 7Zm14 0-3 6a3 3 0 0 0 6 0l-3-6Z" /></svg>
  ),
  lock: (p) => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" {...p}><rect x="5" y="11" width="14" height="10" rx="2.5" /><path d="M8 11V8a4 4 0 0 1 8 0v3" /></svg>
  ),
  list: (p) => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" aria-hidden="true" {...p}><path d="M4 6h16M4 12h16M4 18h10" /></svg>
  ),
  basket: (p) => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" {...p}><path d="M3 9h18l-1.6 9.2a2 2 0 0 1-2 1.8H6.6a2 2 0 0 1-2-1.8L3 9ZM8 9l3-5M16 9l-3-5M9 13v3M15 13v3" /></svg>
  ),
  trophy: (p) => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" {...p}><path d="M8 21h8M12 17v4M7 4h10v5a5 5 0 0 1-10 0V4ZM17 6h3a3 3 0 0 1-3 4M7 6H4a3 3 0 0 0 3 4" /></svg>
  ),
};

export function StoreLogo({ store, size = 28 }) {
  const s = STORE_BY_KEY[store];
  if (!s) return null;
  return (
    <span className="cmp-logo" style={{ width: size, height: size }} title={s.name}>
      <img src={s.logo} alt="" width={size} height={size} loading="lazy" />
    </span>
  );
}

/* ───────────────────────── Tarjeta de producto ───────────────────────── */

export function ProductImage({ src }) {
  const [broken, setBroken] = useState(!src);
  if (broken) return <span className="cmp-noimg" aria-hidden="true"><Icon.basket width="34" height="34" /></span>;
  return <img src={src} alt="" loading="lazy" onError={() => setBroken(true)} />;
}

export const ppuText = (p) => (p.ppu != null ? `${fmt(p.ppu)}/${UNIT_LABEL[p.unit]}` : null);

export function ProductCard({ product, isBest, onCompare, index }) {
  const t = useT();
  const store = STORE_BY_KEY[product.store];
  return (
    <article className="cmp-card" style={{ animationDelay: `${Math.min(index, 12) * 25}ms` }}>
      <button type="button" className="cmp-card-hit" onClick={onCompare} aria-label={t.cardCompare(product.label, store?.name ?? '')} />
      <div className="cmp-card-media">
        <ProductImage src={product.image} />
        <span className="cmp-card-store"><StoreLogo store={product.store} size={26} /></span>
        {isBest && <span className="cmp-badge cmp-badge-best">{t.cardBest(UNIT_LABEL[product.unit])}</span>}
      </div>
      <div className="cmp-card-body">
        <span className="cmp-card-storename">{store?.name}</span>
        <h3 className="cmp-card-name">{product.label}</h3>
        {product.format && <span className="cmp-card-format">{product.format}</span>}
        <div className="cmp-card-price">
          <strong>{fmt(product.price)}</strong>
          {ppuText(product) && <span>{ppuText(product)}</span>}
        </div>
      </div>
      <div className="cmp-card-foot">
        <span className="cmp-card-cmp">
          <Icon.scale width="15" height="15" />
          {t.cmpEyebrow}
        </span>
        <Icon.arrow width="15" height="15" className="cmp-card-go" />
      </div>
    </article>
  );
}

export function SkeletonCard() {
  return (
    <div className="cmp-card cmp-skel" aria-hidden="true">
      <div className="cmp-card-media"><span className="cmp-skel-block cmp-skel-img" /></div>
      <div className="cmp-card-body">
        <span className="cmp-skel-block" style={{ width: '40%', height: 10 }} />
        <span className="cmp-skel-block" style={{ width: '90%', height: 14, marginTop: 8 }} />
        <span className="cmp-skel-block" style={{ width: '65%', height: 14 }} />
        <span className="cmp-skel-block" style={{ width: '45%', height: 22, marginTop: 18 }} />
      </div>
    </div>
  );
}
