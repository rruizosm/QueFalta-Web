import { useEffect, useRef } from 'react';

// Anuncio de AdSense intercalado entre los productos de una cuadrícula. Ocupa
// una fila entera (ver .cmp-ad-feed en comparador.css). Es una unidad de
// display adaptable: Google elige el tamaño según el ancho disponible.
//
// Poner aquí el data-ad-slot de la unidad «Entre productos» creada en AdSense
// (Anuncios → Por unidad de anuncio → Anuncios de display → Adaptable).
// Mientras esté vacío, no se pinta nada.
export const AD_FEED_SLOT = '1046599066';
const AD_CLIENT = 'ca-pub-9749911986318862';

// Cada cuántos productos va un anuncio. Múltiplo de 2, 3 y 4 para que la fila
// anterior quede completa en las cuadrículas de 2 a 4 columnas.
export const AD_FEED_EVERY = 12;

export default function AdInFeed() {
  const ref = useRef(null);
  useEffect(() => {
    if (!AD_FEED_SLOT || !ref.current) return;
    try { (window.adsbygoogle = window.adsbygoogle || []).push({}); } catch (e) {}
  }, []);
  if (!AD_FEED_SLOT) return null;
  return (
    <aside className="cmp-ad-feed" aria-label="Publicidad">
      <ins
        ref={ref}
        className="adsbygoogle"
        style={{ display: 'block' }}
        data-ad-client={AD_CLIENT}
        data-ad-slot={AD_FEED_SLOT}
        data-ad-format="auto"
        data-full-width-responsive="true"
      />
    </aside>
  );
}

// Reparte los productos ya pintados metiendo un anuncio cada AD_FEED_EVERY,
// sin poner ninguno antes del primer bloque ni al final de la lista.
export function withAds(cards, keyPrefix = 'ad') {
  const out = [];
  cards.forEach((card, i) => {
    out.push(card);
    if ((i + 1) % AD_FEED_EVERY === 0 && i < cards.length - 1) {
      out.push(<AdInFeed key={`${keyPrefix}${i}`} />);
    }
  });
  return out;
}
