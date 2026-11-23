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

// variant="card": hueco del tamaño de una tarjeta de producto dentro de una fila
// deslizable (p. ej. «Las mayores bajadas»); pide un rectángulo en vez de una franja.
export default function AdInFeed({ variant = 'row' }) {
  const ref = useRef(null);
  const card = variant === 'card';
  useEffect(() => {
    if (!AD_FEED_SLOT || !ref.current) return;
    try { (window.adsbygoogle = window.adsbygoogle || []).push({}); } catch (e) {}
  }, []);
  if (!AD_FEED_SLOT) return null;
  return (
    <aside className={card ? 'cmp-ad-feed cmp-ad-card' : 'cmp-ad-feed'} aria-label="Publicidad">
      <ins
        ref={ref}
        className="adsbygoogle"
        style={{ display: 'block' }}
        data-ad-client={AD_CLIENT}
        data-ad-slot={AD_FEED_SLOT}
        data-ad-format={card ? 'rectangle' : 'auto'}
        data-full-width-responsive={card ? 'false' : 'true'}
      />
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
