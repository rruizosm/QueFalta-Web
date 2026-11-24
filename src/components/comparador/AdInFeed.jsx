import { useEffect, useRef, useState } from 'react';

// Anuncio de AdSense intercalado entre los productos de una cuadrícula. Ocupa
// una fila entera (ver .cmp-ad-feed en comparador.css). Es una unidad de
// display adaptable: Google elige el tamaño según el ancho disponible.
//
// Poner aquí el data-ad-slot de la unidad «Entre productos» creada en AdSense
// (Anuncios → Por unidad de anuncio → Anuncios de display → Adaptable).
// Mientras esté vacío, no se pinta nada.
export const AD_FEED_SLOT = '1046599066';
const AD_CLIENT = 'ca-pub-9749911986318862';

// Cada cuántas filas de productos va un anuncio. Como el número de columnas
// cambia con el ancho (2 en móvil, más en pantallas grandes), se mide en la
// cuadrícula con useGridColumns y los productos por anuncio = filas × columnas.
export const AD_FEED_ROWS = 2;

// Cuenta las columnas reales de la cuadrícula. Devuelve [columnas, gridRef]:
// gridRef es un ref de callback para el <div className="cmp-grid-cards">, que
// puede aparecer y desaparecer según haya resultados.
export function useGridColumns(fallback = 2) {
  const [cols, setCols] = useState(fallback);
  const [el, setEl] = useState(null);
  useEffect(() => {
    if (!el) return;
    const measure = () => {
      const n = getComputedStyle(el).gridTemplateColumns.split(' ').filter(Boolean).length;
      if (n > 0) setCols(n);
    };
    measure();
    if (typeof ResizeObserver === 'undefined') return;
    const ro = new ResizeObserver(measure);
    ro.observe(el);
    return () => ro.disconnect();
  }, [el]);
  return [cols, setEl];
}

// variant="card": hueco de 300×250 dentro de una fila deslizable (p. ej. «Las
// mayores bajadas / rebajas»), con su propia unidad fija en AdSense.
const AD_CARD_SLOT = '2120378713';
export default function AdInFeed({ variant = 'row' }) {
  const ref = useRef(null);
  const card = variant === 'card';
  const slot = card ? AD_CARD_SLOT : AD_FEED_SLOT;
  useEffect(() => {
    if (!slot || !ref.current) return;
    try { (window.adsbygoogle = window.adsbygoogle || []).push({}); } catch (e) {}
  }, []);
  if (!slot) return null;
  return (
    <aside className={card ? 'cmp-ad-feed cmp-ad-card' : 'cmp-ad-feed'} aria-label="Publicidad">
      {card ? (
        <ins
          ref={ref}
          className="adsbygoogle"
          style={{ display: 'inline-block', width: '300px', height: '250px' }}
          data-ad-client={AD_CLIENT}
          data-ad-slot={slot}
        />
      ) : (
        <ins
          ref={ref}
          className="adsbygoogle"
          style={{ display: 'block' }}
          data-ad-client={AD_CLIENT}
          data-ad-slot={slot}
          data-ad-format="auto"
          data-full-width-responsive="true"
        />
      )}
    </aside>
  );
}

// Banner fijo 320×100 dentro del ranking «Comparar precios» de la ficha de
// producto (móvil y web). Solo se pide si el ranking mide al menos 320 px de
// ancho: en el lateral de escritorio más estrecho no cabe y no se pinta.
const AD_COMPARE_SLOT = '6362876059';
const AD_COMPARE_W = 320;
export function AdCompare() {
  const liRef = useRef(null);
  const insRef = useRef(null);
  const [fit, setFit] = useState(false);
  useEffect(() => {
    const el = liRef.current;
    if (!el) return;
    const measure = () => setFit(el.clientWidth >= AD_COMPARE_W);
    measure();
    if (typeof ResizeObserver === 'undefined') return;
    const ro = new ResizeObserver(measure);
    ro.observe(el);
    return () => ro.disconnect();
  }, []);
  useEffect(() => {
    if (!fit || !insRef.current) return;
    try { (window.adsbygoogle = window.adsbygoogle || []).push({}); } catch (e) {}
  }, [fit]);
  return (
    <li ref={liRef} className={`cmp-ad-compare${fit ? ' is-on' : ''}`} aria-label="Publicidad">
      {fit && (
        <ins
          ref={insRef}
          className="adsbygoogle"
          style={{ display: 'inline-block', width: `${AD_COMPARE_W}px`, height: '100px' }}
          data-ad-client={AD_CLIENT}
          data-ad-slot={AD_COMPARE_SLOT}
        />
      )}
    </li>
  );
}

// Banner 320×100 encima de la foto en la ficha de producto (solo móvil, ≤640 px;
// en pantallas grandes no se pinta). Reutiliza la unidad 320×100 del ranking.
// En desarrollo (localhost, donde AdSense no sirve) sale un marcador.
export function AdProduct() {
  const insRef = useRef(null);
  const [mobile, setMobile] = useState(false);
  useEffect(() => {
    const mq = window.matchMedia('(max-width: 640px)');
    const on = () => setMobile(mq.matches);
    on();
    mq.addEventListener('change', on);
    return () => mq.removeEventListener('change', on);
  }, []);
  const dev = import.meta.env.DEV;
  useEffect(() => {
    if (dev || !mobile || !insRef.current) return;
    try { (window.adsbygoogle = window.adsbygoogle || []).push({}); } catch (e) {}
  }, [mobile]);
  return (
    <aside className="pd-ad" aria-label="Publicidad">
      {dev ? <span className="pd-ad-ph">Anuncio 320×100</span> : mobile && (
        <ins
          ref={insRef}
          className="adsbygoogle"
          style={{ display: 'inline-block', width: `${AD_COMPARE_W}px`, height: '100px' }}
          data-ad-client={AD_CLIENT}
          data-ad-slot={AD_COMPARE_SLOT}
        />
      )}
    </aside>
  );
}

// Filas deslizables: un anuncio-tarjeta cada `every` productos (también al final
// de cada tramo, salvo tras el último producto).
export function withCardAds(cards, every = 2, keyPrefix = 'adc') {
  const out = [];
  cards.forEach((card, i) => {
    out.push(card);
    if ((i + 1) % every === 0 && i < cards.length - 1) {
      out.push(<AdInFeed key={`${keyPrefix}${i}`} variant="card" />);
    }
  });
  return out;
}

// Reparte los productos ya pintados metiendo un anuncio cada AD_FEED_ROWS filas
// (de `cols` columnas), sin poner ninguno al final de la lista.
export function withAds(cards, cols = 2, keyPrefix = 'ad') {
  const every = Math.max(1, cols) * AD_FEED_ROWS;
  const out = [];
  cards.forEach((card, i) => {
    out.push(card);
    if ((i + 1) % every === 0 && i < cards.length - 1) {
      out.push(<AdInFeed key={`${keyPrefix}${i}`} />);
    }
  });
  return out;
}
