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
// 3 = una franja cada 3 filas (decisión del usuario 2026-11-25, antes 1). Con la
// carga diferida de abajo solo se piden las que el usuario llega a ver.
export const AD_FEED_ROWS = 3;

// Carga diferida: el <ins> no se pinta ni se pide hasta que su hueco está a
// AD_NEAR de entrar en pantalla. AdSense cuenta la impresión al servir el
// anuncio, pero solo la da por «visible» si se ve el 50 % durante 1 s: pedir
// anuncios que nadie llega a ver hunde la visibilidad (Active View).
// Ojo: adsbygoogle.push({}) rellena el primer <ins> aún sin procesar del
// documento, así que el <ins> se inserta justo antes de su push (nunca antes).
// IntersectionObserver tiene en cuenta el recorte de los contenedores con
// scroll (filas deslizables, el lateral de la ficha): lo que queda oculto
// dentro de ellos no cuenta como cerca hasta que se desplaza.
const AD_NEAR = '300px 0px';
export function useNearViewport(ref, enabled = true) {
  const [near, setNear] = useState(false);
  useEffect(() => {
    const el = ref.current;
    if (!enabled || near || !el) return undefined;
    if (typeof IntersectionObserver === 'undefined') { setNear(true); return undefined; }
    const io = new IntersectionObserver((entries) => {
      if (entries.some((e) => e.isIntersecting)) { io.disconnect(); setNear(true); }
    }, { rootMargin: AD_NEAR });
    io.observe(el);
    return () => io.disconnect();
  }, [enabled, near]);
  return near;
}

function pushAd() {
  try { (window.adsbygoogle = window.adsbygoogle || []).push({}); } catch (e) {}
}

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
  const boxRef = useRef(null);
  const ref = useRef(null);
  const card = variant === 'card';
  const slot = card ? AD_CARD_SLOT : AD_FEED_SLOT;
  const near = useNearViewport(boxRef, !!slot);
  useEffect(() => {
    if (!slot || !near || !ref.current) return;
    pushAd();
  }, [near]);
  if (!slot) return null;
  return (
    <aside ref={boxRef} className={card ? 'cmp-ad-feed cmp-ad-card' : 'cmp-ad-feed'} aria-label="Publicidad">
      {!near ? null : card ? (
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

// Anuncio dentro del ranking «Comparar precios» de la ficha de producto (móvil
// y web), del mismo ancho que las filas de producto y 100 px de alto.
// · Con AD_COMPARE_FLUID_SLOT (unidad de display ADAPTABLE de AdSense, sin
//   data-ad-format): caja al 100 % del ancho; Google sirve lo que mejor quepa.
// · Sin él, se sigue usando la unidad fija 320×100 (centrada), que solo se
//   pide si la fila mide al menos 320 px.
// En localhost (AdSense no sirve) sale un marcador del ancho completo.
const AD_COMPARE_SLOT = '6362876059';
const AD_COMPARE_W = 320;
const AD_COMPARE_FLUID_SLOT = '7254596375'; // «Comparar precios» (adaptable)
export function AdCompare() {
  const liRef = useRef(null);
  const insRef = useRef(null);
  const [fit, setFit] = useState(false);
  const dev = import.meta.env.DEV;
  const fluid = dev || !!AD_COMPARE_FLUID_SLOT;
  useEffect(() => {
    const el = liRef.current;
    if (!el) return;
    const measure = () => setFit(el.clientWidth >= (fluid ? 250 : AD_COMPARE_W));
    measure();
    if (typeof ResizeObserver === 'undefined') return;
    const ro = new ResizeObserver(measure);
    ro.observe(el);
    return () => ro.disconnect();
  }, []);
  const near = useNearViewport(liRef, fit && !dev);
  useEffect(() => {
    if (dev || !fit || !near || !insRef.current) return;
    pushAd();
  }, [fit, near]);
  return (
    <li ref={liRef} className={`cmp-ad-compare${fit ? ' is-on' : ''}${fluid ? ' is-fluid' : ''}`} aria-label="Publicidad">
      {/* En localhost AdSense no sirve: marcador para ver dónde cae cada anuncio. */}
      {fit && dev && <span className="cmp-ad-ph">Anuncio · ancho de la fila × 100</span>}
      {fit && near && !dev && (
        <ins
          ref={insRef}
          className="adsbygoogle"
          style={fluid
            ? { display: 'block', width: '100%', height: '100px' }
            : { display: 'inline-block', width: `${AD_COMPARE_W}px`, height: '100px' }}
          data-ad-client={AD_CLIENT}
          data-ad-slot={fluid ? AD_COMPARE_FLUID_SLOT : AD_COMPARE_SLOT}
        />
      )}
    </li>
  );
}

// Banner 320×100 arriba de la página, solo en móvil (≤640 px; en pantallas
// grandes no se pinta): encima de la foto en la ficha de producto (pd-ad) y en
// el hueco de los banners de bajadas/ofertas del catálogo (cmp-store-ad).
// Reutiliza la unidad 320×100 del ranking. En desarrollo (localhost, donde
// AdSense no sirve) sale un marcador.
export function AdTop({ className = 'pd-ad' }) {
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
    <aside className={className} aria-label="Publicidad">
      {dev ? <span className="cmp-ad-ph">Anuncio 320×100</span> : mobile && (
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

// Franja de anuncio entre el navbar y las migas: todo el ancho del contenido ×
// 250 px de alto fijos por CSS, con una unidad de display ADAPTABLE sin
// data-ad-format (Google sirve lo que mejor quepa: 970×250, 728×90, 300×250…)
// sin mover la página.
// · Ficha de producto (pd-ad-wide, producto.css): solo ≥641 px; en móvil lleva
//   su 320×100 encima de la foto (AdTop).
// · Catálogo de cada súper (cmp-ad-wide, comparador.css, con `always`): a
//   cualquier ancho, también en móvil, siempre en el mismo sitio.
// En localhost (AdSense no sirve) sale un marcador.
const AD_WIDE_SLOT = '2748054353'; // «Franja superior supermercado» (adaptable)
export function AdWide({ className = 'pd-ad-wide', always = false, compactMobile = false }) {
  const insRef = useRef(null);
  const [on, setOn] = useState(false);
  // compactMobile: en móvil (≤640 px) la franja baja a 100 px de alto, para que
  // el contenido se vea antes (catálogo de cada súper, prueba 2026-11-25).
  const [small, setSmall] = useState(false);
  useEffect(() => {
    if (always) {
      if (compactMobile) setSmall(window.matchMedia('(max-width: 640px)').matches);
      setOn(true);
      return undefined;
    }
    const mq = window.matchMedia('(min-width: 641px)');
    const sync = () => setOn(mq.matches);
    sync();
    mq.addEventListener('change', sync);
    return () => mq.removeEventListener('change', sync);
  }, [always, compactMobile]);
  const dev = import.meta.env.DEV;
  useEffect(() => {
    if (dev || !on || !insRef.current) return;
    try { (window.adsbygoogle = window.adsbygoogle || []).push({}); } catch (e) {}
  }, [on]);
  // El alto se fija al pedir el anuncio: no cambia si luego se gira o redimensiona.
  const h = small ? 100 : 250;
  return (
    <aside className={`${className}${small ? ' is-compact' : ''}`} aria-label="Publicidad">
      {dev && on && <span className="cmp-ad-ph" style={{ height: `${h}px` }}>Anuncio · todo el ancho × {h}</span>}
      {!dev && on && (
        <ins
          ref={insRef}
          className="adsbygoogle"
          style={{ display: 'block', width: '100%', height: `${h}px` }}
          data-ad-client={AD_CLIENT}
          data-ad-slot={AD_WIDE_SLOT}
        />
      )}
    </aside>
  );
}

// Filas deslizables: UN solo anuncio-tarjeta, tras los `after` primeros
// productos (a la vista al cargar en escritorio). Antes iba uno cada 2 y los
// de más a la derecha, fuera de pantalla, no los veía casi nadie.
export function withCardAds(cards, after = 2, keyPrefix = 'adc') {
  if (cards.length <= after) return cards;
  return [...cards.slice(0, after), <AdInFeed key={`${keyPrefix}${after}`} variant="card" />, ...cards.slice(after)];
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
